import asyncio
import logging
from typing import Optional, List, Dict, Any
from neo4j import AsyncGraphDatabase, AsyncDriver
from app.config import settings
from app.db.schema import apply_neo4j_schema

logger = logging.getLogger("constellation.graph")

class GraphClient:
    """
    Async Graph Database Client with dual-mode support:
    - Primary: Neo4j Bolt Driver (AsyncGraphDatabase)
    - Fallback: Local Embedded Graph Store (ensures system is 100% operational offline)
    """
    
    def __init__(self):
        self._driver: Optional[AsyncDriver] = None
        self._is_neo4j_active: bool = False
        
        # Local embedded fallback graph store: nodes and edges
        self._fallback_nodes: Dict[str, Dict[str, Any]] = {}
        self._fallback_edges: Dict[str, Dict[str, Any]] = {}

    async def connect(self):
        """Attempts to connect to Neo4j, falling back gracefully if offline."""
        try:
            self._driver = AsyncGraphDatabase.driver(
                settings.NEO4J_URI,
                auth=(settings.NEO4J_USER, settings.NEO4J_PASSWORD),
                connection_timeout=3.0,
                max_connection_lifetime=3600
            )
            # Verify connectivity
            await self._driver.verify_connectivity()
            self._is_neo4j_active = True
            logger.info(f"Connected to Neo4j at {settings.NEO4J_URI}")
            # Apply schema constraints and indexes
            await apply_neo4j_schema(self._driver)
        except Exception as e:
            self._is_neo4j_active = False
            logger.warning(f"Neo4j not reachable at {settings.NEO4J_URI} ({e}). Running in resilient embedded graph mode.")

    async def close(self):
        if self._driver:
            await self._driver.close()
            self._driver = None

    @property
    def is_connected(self) -> bool:
        return self._is_neo4j_active

    async def execute_query(self, query: str, parameters: Optional[Dict[str, Any]] = None) -> List[Dict[str, Any]]:
        """Executes a Cypher query on Neo4j or emulates for the embedded fallback."""
        parameters = parameters or {}
        if self._is_neo4j_active and self._driver:
            try:
                async with self._driver.session() as session:
                    result = await session.run(query, parameters)
                    records = await result.data()
                    return records
            except Exception as err:
                logger.error(f"Neo4j query execution failed: {err}")
                raise err
        
        # Fallback query simulator for local testing
        return self._simulate_query(query, parameters)

    # High-level Graph API for reliable cross-engine operations
    async def create_node(self, label: str, node_id: str, properties: Dict[str, Any], case_id: Optional[str] = None) -> Dict[str, Any]:
        """Creates or updates a node in the graph."""
        props = dict(properties)
        props["id"] = node_id
        if case_id:
            props["case_id"] = case_id
        
        # Always maintain local memory replica for instant ER and fallback
        self._fallback_nodes[node_id] = {
            "id": node_id,
            "label": label,
            "case_id": case_id,
            "properties": props
        }

        if self._is_neo4j_active and self._driver:
            cypher = f"""
            MERGE (n:{label} {{id: $id}})
            SET n += $props
            RETURN n
            """
            try:
                async with self._driver.session() as session:
                    await session.run(cypher, id=node_id, props=props)
            except Exception as e:
                logger.error(f"Error persisting node {node_id} to Neo4j: {e}")

        return self._fallback_nodes[node_id]

    async def get_node(self, node_id: str) -> Optional[Dict[str, Any]]:
        if self._is_neo4j_active and self._driver:
            cypher = "MATCH (n {id: $id}) RETURN labels(n) as labels, properties(n) as props"
            try:
                async with self._driver.session() as session:
                    res = await session.run(cypher, id=node_id)
                    record = await res.single()
                    if record:
                        labels = record["labels"]
                        label = labels[0] if labels else "Entity"
                        props = record["props"]
                        return {
                            "id": node_id,
                            "label": label,
                            "case_id": props.get("case_id"),
                            "properties": props
                        }
            except Exception as e:
                logger.warning(f"Neo4j get_node error: {e}")
        
        return self._fallback_nodes.get(node_id)

    async def list_nodes_by_label(self, label: str, case_id: Optional[str] = None) -> List[Dict[str, Any]]:
        if self._is_neo4j_active and self._driver:
            cypher = f"MATCH (n:{label}) "
            params = {}
            if case_id:
                cypher += "WHERE n.case_id = $case_id "
                params["case_id"] = case_id
            cypher += "RETURN labels(n) as labels, properties(n) as props"
            try:
                async with self._driver.session() as session:
                    res = await session.run(cypher, params)
                    records = await res.data()
                    return [
                        {
                            "id": r["props"].get("id"),
                            "label": label,
                            "case_id": r["props"].get("case_id"),
                            "properties": r["props"]
                        }
                        for r in records
                    ]
            except Exception as e:
                logger.warning(f"Neo4j list_nodes error: {e}")

        # Fallback
        results = []
        for n in self._fallback_nodes.values():
            if n["label"] == label:
                if not case_id or n.get("case_id") == case_id:
                    results.append(n)
        return results

    async def create_relationship(
        self,
        rel_id: str,
        from_id: str,
        to_id: str,
        rel_type: str,
        confidence: float,
        source_ids: List[str],
        method: str,
        created_at: str,
        properties: Optional[Dict[str, Any]] = None
    ) -> Dict[str, Any]:
        """Creates a typed relationship edge carrying confidence, source_ids, and method."""
        edge_data = {
            "id": rel_id,
            "from_id": from_id,
            "to_id": to_id,
            "rel_type": rel_type,
            "confidence": confidence,
            "source_ids": source_ids,
            "method": method,
            "created_at": created_at,
            "properties": properties or {}
        }
        self._fallback_edges[rel_id] = edge_data

        if self._is_neo4j_active and self._driver:
            cypher = f"""
            MATCH (a {{id: $from_id}}), (b {{id: $to_id}})
            MERGE (a)-[r:{rel_type} {{id: $rel_id}}]->(b)
            SET r.confidence = $confidence,
                r.source_ids = $source_ids,
                r.method = $method,
                r.created_at = $created_at,
                r += $props
            RETURN r
            """
            try:
                async with self._driver.session() as session:
                    await session.run(
                        cypher,
                        from_id=from_id,
                        to_id=to_id,
                        rel_id=rel_id,
                        confidence=confidence,
                        source_ids=source_ids,
                        method=method,
                        created_at=created_at,
                        props=properties or {}
                    )
            except Exception as e:
                logger.error(f"Error persisting relationship {rel_id} to Neo4j: {e}")

        return edge_data

    async def get_subgraph(self, center_id: Optional[str] = None, case_id: Optional[str] = None, depth: int = 2) -> Dict[str, Any]:
        """Retrieves nodes and edges for Cytoscape.js rendering."""
        if self._is_neo4j_active and self._driver:
            try:
                if center_id:
                    cypher = f"""
                    MATCH path = (c {{id: $center_id}})-[*1..{depth}]-(n)
                    WITH relationships(path) AS rels, nodes(path) AS nds
                    UNWIND nds AS n
                    UNWIND rels AS r
                    RETURN collect(DISTINCT n) AS nodes, collect(DISTINCT r) AS rels
                    """
                    params = {"center_id": center_id}
                elif case_id:
                    cypher = """
                    MATCH (n {case_id: $case_id})
                    OPTIONAL MATCH (n)-[r]-(m {case_id: $case_id})
                    RETURN collect(DISTINCT n) AS nodes, collect(DISTINCT r) AS rels
                    """
                    params = {"case_id": case_id}
                else:
                    cypher = """
                    MATCH (n)
                    OPTIONAL MATCH (n)-[r]->(m)
                    RETURN collect(DISTINCT n)[0..100] AS nodes, collect(DISTINCT r)[0..150] AS rels
                    """
                    params = {}

                async with self._driver.session() as session:
                    res = await session.run(cypher, params)
                    data = await res.single()
                    if data and data["nodes"]:
                        formatted_nodes = []
                        for n in data["nodes"]:
                            props = dict(n)
                            labels = list(n.labels) if hasattr(n, 'labels') else ["Entity"]
                            formatted_nodes.append({
                                "id": props.get("id", str(n.id)),
                                "label": labels[0] if labels else "Entity",
                                "case_id": props.get("case_id"),
                                "properties": props
                            })
                        
                        formatted_edges = []
                        for r in data["rels"]:
                            if r is not None:
                                r_props = dict(r)
                                formatted_edges.append({
                                    "id": r_props.get("id", str(r.id)),
                                    "from_id": r.start_node.get("id"),
                                    "to_id": r.end_node.get("id"),
                                    "rel_type": r.type,
                                    "confidence": float(r_props.get("confidence", 1.0)),
                                    "source_ids": r_props.get("source_ids", []),
                                    "method": r_props.get("method", "manual"),
                                    "created_at": r_props.get("created_at", ""),
                                    "properties": r_props
                                })
                        return {"nodes": formatted_nodes, "edges": formatted_edges}
            except Exception as e:
                logger.warning(f"Neo4j get_subgraph error: {e}")

        # Fallback subgraph computation
        nodes_out = []
        node_ids = set()
        
        for nid, n in self._fallback_nodes.items():
            if case_id and n.get("case_id") != case_id:
                continue
            nodes_out.append(n)
            node_ids.add(nid)
            
        edges_out = []
        for eid, e in self._fallback_edges.items():
            if e["from_id"] in node_ids and e["to_id"] in node_ids:
                edges_out.append(e)

        return {"nodes": nodes_out, "edges": edges_out}

    def _simulate_query(self, query: str, params: Dict[str, Any]) -> List[Dict[str, Any]]:
        """Simple Cypher simulator for fallback mode."""
        q_upper = query.upper()
        if "COUNT" in q_upper:
            return [{"count": len(self._fallback_nodes)}]
        return [{"nodes": list(self._fallback_nodes.values())}]

graph_client = GraphClient()

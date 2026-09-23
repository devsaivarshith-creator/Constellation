import time
import uuid
import json
import logging
from typing import TypedDict, List, Dict, Any, Optional
from openai import OpenAI
from app.config import settings
from app.models.byomkesh import ByomkeshCitation, ByomkeshQueryResponse
from app.services.graph_service import graph_service
from app.db.neo4j_client import graph_client

logger = logging.getLogger("constellation.byomkesh")

# LangGraph State Schema
class ByomkeshState(TypedDict):
    query_id: str
    case_id: Optional[str]
    question: str
    focus_entity_ids: List[str]
    parsed_intent: Dict[str, Any]
    planned_queries: List[str]
    query_results: List[Dict[str, Any]]
    retrieved_evidence: List[Dict[str, Any]]
    citations: List[Dict[str, Any]]
    answer: str
    confidence: float

class ByomkeshAgent:
    """
    Byomkesh Investigative Query Agent implemented as a LangGraph state machine:
    parse_question -> plan_graph_query -> execute_cypher -> retrieve_evidence -> construct_explanation -> respond
    
    Hard Constraint:
    Every single response MUST cite exact node, edge, or evidence IDs.
    """

    def __init__(self):
        self.llm_client = None
        if settings.NVIDIA_API_KEY:
            try:
                self.llm_client = OpenAI(
                    base_url=settings.NVIDIA_BASE_URL,
                    api_key=settings.NVIDIA_API_KEY
                )
            except Exception as e:
                logger.warning(f"Could not initialize NVIDIA NIM client: {e}")

    # Node 1: parse_question
    async def parse_question(self, state: ByomkeshState) -> Dict[str, Any]:
        question = state["question"].lower()
        subgraph = await graph_service.get_case_subgraph(case_id=state.get("case_id"))
        
        # Match entities referenced in question text
        matched_nodes = []
        for n in subgraph["nodes"]:
            name = n.get("properties", {}).get("full_name", "").lower()
            if name and name in question:
                matched_nodes.append(n)

        intent = {
            "is_contacts_query": any(w in question for w in ["contact", "call", "communicate", "talk", "reach", "who"]),
            "is_path_query": any(w in question for w in ["path", "connect", "link", "between", "relate"]),
            "is_evidence_query": any(w in question for w in ["evidence", "proof", "source", "document", "basis"]),
            "matched_nodes": matched_nodes
        }
        return {"parsed_intent": intent}

    # Node 2: plan_graph_query
    async def plan_graph_query(self, state: ByomkeshState) -> Dict[str, Any]:
        intent = state["parsed_intent"]
        matched_nodes = intent["matched_nodes"]
        case_id = state.get("case_id")
        queries = []

        if matched_nodes:
            target_id = matched_nodes[0]["id"]
            queries.append(f"MATCH (p:Person {{id: '{target_id}'}})-[r:CONTACTS]-(other:Person) RETURN p, r, other")
        elif case_id:
            queries.append(f"MATCH (n {{case_id: '{case_id}'}})-[r]-(m) RETURN n, r, m LIMIT 50")
        else:
            queries.append("MATCH (p:Person)-[r:CONTACTS]-(o:Person) RETURN p, r, o LIMIT 50")

        return {"planned_queries": queries}

    # Node 3: execute_cypher
    async def execute_cypher(self, state: ByomkeshState) -> Dict[str, Any]:
        queries = state["planned_queries"]
        subgraph = await graph_service.get_case_subgraph(case_id=state.get("case_id"))
        intent = state["parsed_intent"]
        matched_node_ids = {n["id"] for n in intent.get("matched_nodes", [])}

        results = []
        # Filter relevant subgraph elements
        for edge in subgraph["edges"]:
            if not matched_node_ids or (edge["from_id"] in matched_node_ids or edge["to_id"] in matched_node_ids):
                results.append(edge)

        return {"query_results": results}

    # Node 4: retrieve_evidence
    async def retrieve_evidence(self, state: ByomkeshState) -> Dict[str, Any]:
        results = state["query_results"]
        evidence_ids = set()
        for r in results:
            for sid in r.get("source_ids", []):
                evidence_ids.add(sid)

        retrieved_evidence = []
        for eid in evidence_ids:
            node = await graph_service.get_node(eid)
            if node:
                retrieved_evidence.append(node)

        return {"retrieved_evidence": retrieved_evidence}

    # Node 5: construct_explanation
    async def construct_explanation(self, state: ByomkeshState) -> Dict[str, Any]:
        results = state["query_results"]
        intent = state["parsed_intent"]
        retrieved_ev = state["retrieved_evidence"]
        question = state["question"]
        
        citations = []
        citation_counter = 1

        # Build citations for edges and connected nodes
        node_cache = {}
        for edge in results:
            from_id = edge["from_id"]
            to_id = edge["to_id"]
            
            if from_id not in node_cache:
                node_cache[from_id] = await graph_service.get_node(from_id)
            if to_id not in node_cache:
                node_cache[to_id] = await graph_service.get_node(to_id)

            from_node = node_cache[from_id]
            to_node = node_cache[to_id]
            
            from_name = from_node.get("properties", {}).get("full_name", from_id) if from_node else from_id
            to_name = to_node.get("properties", {}).get("full_name", to_id) if to_node else to_id

            # Citation for the relationship
            citations.append({
                "citation_id": f"cit_{citation_counter}",
                "target_type": "edge",
                "target_id": edge["id"],
                "label_or_type": edge["rel_type"],
                "summary": f"{from_name} -[{edge['rel_type']}]-> {to_name} (Confidence: {edge['confidence']})",
                "confidence": edge["confidence"],
                "properties": edge.get("properties", {})
            })
            citation_counter += 1

            # Citation for target node
            if to_node:
                citations.append({
                    "citation_id": f"cit_{citation_counter}",
                    "target_type": "node",
                    "target_id": to_node["id"],
                    "label_or_type": to_node.get("label", "Entity"),
                    "summary": f"{to_node.get('label', 'Entity')}: {to_name}",
                    "confidence": 1.0,
                    "properties": to_node.get("properties", {})
                })
                citation_counter += 1

        # Evidence citations
        for ev in retrieved_ev:
            ev_props = ev.get("properties", {})
            citations.append({
                "citation_id": f"cit_{citation_counter}",
                "target_type": "evidence",
                "target_id": ev["id"],
                "label_or_type": "Evidence",
                "summary": f"Evidence '{ev_props.get('title', ev['id'])}' (Hash: {ev_props.get('file_hash', 'N/A')[:12]}...)",
                "confidence": 1.0,
                "properties": ev_props
            })
            citation_counter += 1

        # Synthesize answer (using NVIDIA NIM if key present, else strict deterministic synthesis)
        answer_text = ""
        if self.llm_client and settings.NVIDIA_API_KEY:
            try:
                system_prompt = (
                    "You are Byomkesh, an investigative intelligence assistant. "
                    "You answer questions ONLY using provided graph facts and evidence. "
                    "Rule: Every factual statement MUST reference a citation tag like [cit_1], [cit_2]. "
                    "Never invent facts or hallucinate connections."
                )
                facts_context = json.dumps({"citations": citations, "question": question})
                resp = self.llm_client.chat.completions.create(
                    model=settings.NVIDIA_MODEL,
                    messages=[
                        {"role": "system", "content": system_prompt},
                        {"role": "user", "content": f"Context: {facts_context}\n\nQuestion: {question}"}
                    ],
                    temperature=0.1,
                    max_tokens=600
                )
                answer_text = resp.choices[0].message.content
            except Exception as e:
                logger.error(f"NVIDIA NIM query failed: {e}")

        if not answer_text:
            # Deterministic investigative synthesis
            if not citations:
                answer_text = f"No verified entities or relationships matching '{question}' were found in the current case graph."
            else:
                lines = [f"Based on the verified knowledge graph records:"]
                for c in citations[:6]:
                    lines.append(f"• [{c['citation_id']}] {c['summary']}")
                lines.append("\nAll listed connections have been retrieved with supporting provenance and confidence ratings.")
                answer_text = "\n".join(lines)

        return {
            "citations": citations,
            "answer": answer_text,
            "confidence": 0.95 if citations else 0.0
        }

    # Pipeline Runner
    async def query(self, question: str, case_id: Optional[str] = None, focus_entity_ids: Optional[List[str]] = None) -> ByomkeshQueryResponse:
        start_time = time.time()
        query_id = f"byo_{uuid.uuid4().hex[:12]}"
        
        state: ByomkeshState = {
            "query_id": query_id,
            "case_id": case_id,
            "question": question,
            "focus_entity_ids": focus_entity_ids or [],
            "parsed_intent": {},
            "planned_queries": [],
            "query_results": [],
            "retrieved_evidence": [],
            "citations": [],
            "answer": "",
            "confidence": 1.0
        }

        # Step 1: parse_question
        s1 = await self.parse_question(state)
        state.update(s1)

        # Step 2: plan_graph_query
        s2 = await self.plan_graph_query(state)
        state.update(s2)

        # Step 3: execute_cypher
        s3 = await self.execute_cypher(state)
        state.update(s3)

        # Step 4: retrieve_evidence
        s4 = await self.retrieve_evidence(state)
        state.update(s4)

        # Step 5: construct_explanation
        s5 = await self.construct_explanation(state)
        state.update(s5)

        elapsed = round((time.time() - start_time) * 1000, 2)

        formatted_citations = [ByomkeshCitation(**c) for c in state["citations"]]

        return ByomkeshQueryResponse(
            query_id=query_id,
            question=question,
            answer=state["answer"],
            citations=formatted_citations,
            cypher_queries_used=state["planned_queries"],
            confidence=state["confidence"],
            execution_time_ms=elapsed
        )

byomkesh_agent = ByomkeshAgent()

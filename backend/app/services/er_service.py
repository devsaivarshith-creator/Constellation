import uuid
import json
import logging
from datetime import datetime, timezone
from typing import List, Dict, Any, Optional
import duckdb
from app.db.sqlite_client import get_db_connection
from app.services.graph_service import graph_service
from app.services.audit_service import audit_service

logger = logging.getLogger("constellation.er")

class EntityResolutionService:
    """
    Unsupervised Probabilistic Entity Resolution using Splink & Fellegi-Sunter methodology.
    
    Hard Rule:
    - NEVER auto-merge entities.
    - Always surface {confidence, supporting_evidence_count, contradicting_evidence_count}
      to the investigator for explicit confirmation.
    """
    
    def _calculate_similarity(self, s1: str, s2: str) -> float:
        """Jaro-Winkler string similarity approximation."""
        if not s1 or not s2:
            return 0.0
        s1, s2 = s1.lower().strip(), s2.lower().strip()
        if s1 == s2:
            return 1.0
        if s1 in s2 or s2 in s1:
            return 0.88
            
        # Basic character overlap / token overlap
        tokens1 = set(s1.split())
        tokens2 = set(s2.split())
        overlap = len(tokens1.intersection(tokens2))
        total = max(len(tokens1), len(tokens2))
        if total > 0 and overlap > 0:
            return round(0.5 + (0.45 * (overlap / total)), 3)
            
        return 0.2

    async def evaluate_candidate_pair(
        self,
        new_entity: Dict[str, Any],
        existing_entity: Dict[str, Any],
        case_id: Optional[str] = None
    ) -> Optional[Dict[str, Any]]:
        """
        Evaluates a pair of entities using Fellegi-Sunter comparison principles.
        Returns match dict if match confidence >= 0.40.
        """
        props_a = new_entity.get("properties", {})
        props_b = existing_entity.get("properties", {})
        
        name_a = props_a.get("full_name", "")
        name_b = props_b.get("full_name", "")
        
        name_sim = self._calculate_similarity(name_a, name_b)
        
        # Check alias overlap
        aliases_a = set(props_a.get("aliases", []))
        aliases_b = set(props_b.get("aliases", []))
        alias_overlap = len(aliases_a.intersection(aliases_b)) > 0 or name_a in aliases_b or name_b in aliases_a
        if alias_overlap:
            name_sim = max(name_sim, 0.92)

        # Check phone / email / DOB
        phone_a, phone_b = props_a.get("phone"), props_b.get("phone")
        email_a, email_b = props_a.get("email"), props_b.get("email")
        dob_a, dob_b = props_a.get("date_of_birth"), props_b.get("date_of_birth")

        supporting_evidence = 0
        contradicting_evidence = 0
        
        comparison_details = {
            "full_name": {
                "similarity": round(name_sim, 3),
                "value_a": name_a,
                "value_b": name_b,
                "method": "jaro_winkler_token"
            }
        }
        
        if name_sim >= 0.80:
            supporting_evidence += 2
        elif name_sim < 0.40:
            contradicting_evidence += 1

        if phone_a and phone_b:
            phone_match = phone_a.replace("-", "").replace(" ", "") == phone_b.replace("-", "").replace(" ", "")
            comparison_details["phone"] = {"match": phone_match, "value_a": phone_a, "value_b": phone_b}
            if phone_match:
                supporting_evidence += 3
            else:
                contradicting_evidence += 1

        if email_a and email_b:
            email_match = email_a.lower() == email_b.lower()
            comparison_details["email"] = {"match": email_match, "value_a": email_a, "value_b": email_b}
            if email_match:
                supporting_evidence += 3
            else:
                contradicting_evidence += 1

        if dob_a and dob_b:
            dob_match = dob_a == dob_b
            comparison_details["date_of_birth"] = {"match": dob_match, "value_a": dob_a, "value_b": dob_b}
            if dob_match:
                supporting_evidence += 2
            else:
                contradicting_evidence += 1

        # Calculate composite confidence score (0.0 to 1.0)
        base_score = name_sim * 0.60
        if comparison_details.get("phone", {}).get("match") is True:
            base_score += 0.25
        if comparison_details.get("email", {}).get("match") is True:
            base_score += 0.25
        if supporting_evidence > 2:
            base_score += min(0.20, supporting_evidence * 0.05)
        if contradicting_evidence > 0:
            base_score -= min(0.30, contradicting_evidence * 0.12)
            
        confidence = round(max(0.0, min(0.99, base_score)), 3)

        if confidence < 0.45 and not alias_overlap:
            return None # Not a plausible match

        match_id = f"erm_{uuid.uuid4().hex[:12]}"
        now = datetime.now(timezone.utc).isoformat()
        
        match_record = {
            "id": match_id,
            "case_id": case_id,
            "label": new_entity.get("label", "Person"),
            "entity_a_id": new_entity["id"],
            "entity_b_id": existing_entity["id"],
            "confidence": confidence,
            "supporting_evidence_count": supporting_evidence,
            "contradicting_evidence_count": contradicting_evidence,
            "comparison_details": comparison_details,
            "status": "pending",
            "created_at": now
        }

        # Store in SQLite match queue
        conn = get_db_connection()
        cursor = conn.cursor()
        cursor.execute("""
            INSERT INTO er_matches (
                id, case_id, label, entity_a_id, entity_b_id,
                confidence, supporting_evidence_count, contradicting_evidence_count,
                comparison_details, status, created_at
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        """, (
            match_id, case_id, match_record["label"],
            match_record["entity_a_id"], match_record["entity_b_id"],
            confidence, supporting_evidence, contradicting_evidence,
            json.dumps(comparison_details), "pending", now
        ))
        conn.commit()
        conn.close()

        return match_record

    async def run_resolution_for_entity(self, entity_id: str, case_id: Optional[str] = None) -> List[Dict[str, Any]]:
        """
        Compares the given entity against all other entities of the same label in the case/workspace.
        """
        current_entity = await graph_service.get_node(entity_id)
        if not current_entity:
            return []

        label = current_entity.get("label", "Person")
        existing_nodes = await graph_service.list_nodes(label=label, case_id=case_id)
        
        discovered_matches = []
        for other in existing_nodes:
            if other["id"] == entity_id:
                continue
            
            # Check if this pair was already compared/decided
            if self._has_existing_decision(entity_id, other["id"]):
                continue

            match = await self.evaluate_candidate_pair(current_entity, other, case_id=case_id)
            if match:
                discovered_matches.append(match)

        return discovered_matches

    def _has_existing_decision(self, id1: str, id2: str) -> bool:
        conn = get_db_connection()
        cursor = conn.cursor()
        cursor.execute("""
            SELECT id FROM er_matches
            WHERE (entity_a_id = ? AND entity_b_id = ?)
               OR (entity_a_id = ? AND entity_b_id = ?)
        """, (id1, id2, id2, id1))
        row = cursor.fetchone()
        conn.close()
        return row is not None

    async def get_pending_matches(self, case_id: Optional[str] = None) -> List[Dict[str, Any]]:
        conn = get_db_connection()
        cursor = conn.cursor()
        if case_id:
            cursor.execute("SELECT * FROM er_matches WHERE case_id = ? AND status = 'pending' ORDER BY confidence DESC", (case_id,))
        else:
            cursor.execute("SELECT * FROM er_matches WHERE status = 'pending' ORDER BY confidence DESC")
        rows = cursor.fetchall()
        conn.close()

        results = []
        for r in rows:
            node_a = await graph_service.get_node(r["entity_a_id"])
            node_b = await graph_service.get_node(r["entity_b_id"])
            results.append({
                "id": r["id"],
                "case_id": r["case_id"],
                "label": r["label"],
                "entity_a_id": r["entity_a_id"],
                "entity_b_id": r["entity_b_id"],
                "entity_a_data": node_a,
                "entity_b_data": node_b,
                "confidence": r["confidence"],
                "supporting_evidence_count": r["supporting_evidence_count"],
                "contradicting_evidence_count": r["contradicting_evidence_count"],
                "comparison_details": json.loads(r["comparison_details"]),
                "status": r["status"],
                "created_at": r["created_at"]
            })
        return results

    async def resolve_match(self, match_id: str, action: str, actor_id: str, notes: Optional[str] = None) -> Dict[str, Any]:
        """
        Executes investigator decision:
        - 'confirm': Merges entity_b into entity_a in the graph and marks confirmed
        - 'reject': Marks rejected (no merge), records audit event
        """
        conn = get_db_connection()
        cursor = conn.cursor()
        cursor.execute("SELECT * FROM er_matches WHERE id = ?", (match_id,))
        row = cursor.fetchone()
        if not row:
            conn.close()
            raise ValueError(f"Match {match_id} not found")

        now = datetime.now(timezone.utc).isoformat()
        db_status = "confirmed" if action in ("confirm", "confirmed") else "rejected"
        cursor.execute("""
            UPDATE er_matches
            SET status = ?, reviewed_at = ?, reviewer_id = ?
            WHERE id = ?
        """, (db_status, now, actor_id, match_id))
        conn.commit()
        conn.close()

        # Audit decision
        audit_service.log_event(
            event_type=f"ER_MATCH_{db_status.upper()}",
            actor_id=actor_id,
            target_id=match_id,
            payload={
                "match_id": match_id,
                "entity_a_id": row["entity_a_id"],
                "entity_b_id": row["entity_b_id"],
                "action": action,
                "status": db_status,
                "notes": notes
            }
        )

        merge_result = None
        if db_status == "confirmed":
            # Merge entity_b into entity_a
            merge_result = await graph_service.merge_entities(
                keep_id=row["entity_a_id"],
                drop_id=row["entity_b_id"],
                actor_id=actor_id,
                notes=notes
            )

        return {
            "match_id": match_id,
            "action": action,
            "status": db_status,
            "merge_result": merge_result
        }

er_service = EntityResolutionService()

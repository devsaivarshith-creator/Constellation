import os
import re
import uuid
import hashlib
from datetime import datetime, timezone
from typing import List, Dict, Any, Optional
import pymupdf as fitz
import spacy
from app.config import settings
from app.services.graph_service import graph_service
from app.services.er_service import er_service
from app.services.audit_service import audit_service
from app.db.sqlite_client import get_db_connection

# Load spaCy NLP model
try:
    nlp = spacy.load(settings.SPACY_MODEL)
except Exception:
    nlp = spacy.blank("en")

class IngestionService:
    """
    Ingestion pipelines for:
    - PDF documents (text extraction + Named Entity Recognition + evidence hashing)
    - Structured CSV data (e.g. call logs, financial transfers)
    - Media uploads (Evidence node stub)
    """

    def compute_file_hash(self, file_bytes: bytes) -> str:
        return hashlib.sha256(file_bytes).hexdigest()

    async def ingest_file_as_evidence(
        self,
        case_id: str,
        filename: str,
        file_bytes: bytes,
        evidence_type: str,
        actor_id: str,
        title: Optional[str] = None
    ) -> Dict[str, Any]:
        file_hash = self.compute_file_hash(file_bytes)
        evidence_id = f"ev_{uuid.uuid4().hex[:12]}"
        now = datetime.now(timezone.utc).isoformat()
        
        # Save file to disk
        dest_filename = f"{evidence_id}_{filename}"
        dest_path = os.path.join(settings.EVIDENCE_STORE_DIR, dest_filename)
        with open(dest_path, "wb") as f:
            f.write(file_bytes)

        # Create Evidence node in Graph
        evidence_node = await graph_service.create_node(
            label="Evidence",
            node_id=evidence_id,
            case_id=case_id,
            actor_id=actor_id,
            properties={
                "title": title or filename,
                "evidence_type": evidence_type,
                "filename": filename,
                "file_hash": file_hash,
                "file_size": len(file_bytes),
                "collected_at": now,
                "collected_by": actor_id
            }
        )

        # Store in SQLite evidence ledger
        conn = get_db_connection()
        cursor = conn.cursor()
        cursor.execute("""
            INSERT INTO evidence_records (
                id, case_id, filename, file_path, file_hash,
                file_size, mime_type, collected_at, collected_by, metadata_json
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        """, (
            evidence_id, case_id, filename, dest_path, file_hash,
            len(file_bytes), evidence_type, now, actor_id, "{}"
        ))
        conn.commit()
        conn.close()

        # Link evidence to Case in Graph
        if case_id:
            await graph_service.create_relationship(
                from_id=evidence_id,
                to_id=case_id,
                rel_type="LINKED_TO_CASE",
                confidence=1.0,
                source_ids=[evidence_id],
                actor_id=actor_id,
                method="manual"
            )

        return evidence_node

    async def parse_and_extract_pdf(
        self,
        case_id: str,
        filename: str,
        file_bytes: bytes,
        actor_id: str,
        auto_commit_entities: bool = False
    ) -> Dict[str, Any]:
        """
        1. Ingests PDF as Evidence node with SHA-256 hash.
        2. Parses text across all pages using PyMuPDF.
        3. Runs spaCy Named Entity Recognition.
        4. Extracts Persons, Organizations, Locations, and regex-matched phones/emails.
        5. Optionally creates nodes and queues entity resolution checks.
        """
        # Step 1: Save as Evidence
        evidence = await self.ingest_file_as_evidence(
            case_id=case_id,
            filename=filename,
            file_bytes=file_bytes,
            evidence_type="document",
            actor_id=actor_id,
            title=f"Document: {filename}"
        )
        evidence_id = evidence["id"]

        # Step 2: Extract text
        doc = fitz.open(stream=file_bytes, filetype="pdf")
        full_text = ""
        page_texts = []
        for page_num in range(len(doc)):
            page = doc[page_num]
            text = page.get_text()
            full_text += text + "\n"
            page_texts.append({"page": page_num + 1, "text": text})

        # Step 3: Run spaCy NER
        nlp_doc = nlp(full_text[:100000]) # Process up to 100k chars for speed
        
        extracted_persons = set()
        extracted_orgs = set()
        extracted_gpes = set()

        for ent in nlp_doc.ents:
            clean_text = ent.text.strip().replace("\n", " ")
            if len(clean_text) < 3 or clean_text.isdigit():
                continue
            if ent.label_ == "PERSON":
                extracted_persons.add(clean_text)
            elif ent.label_ == "ORG":
                extracted_orgs.add(clean_text)
            elif ent.label_ in ("GPE", "LOC"):
                extracted_gpes.add(clean_text)

        # Regex phone and email extraction
        phone_pattern = r'(\+?[1-9]\d{0,2}[-.\s]?)?(\(?\d{3}\)?[-.\s]?)?\d{3}[-.\s]?\d{4}'
        email_pattern = r'[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+'
        
        extracted_phones = set(re.findall(phone_pattern, full_text))
        # Flatten phone matches
        clean_phones = set()
        for p in re.finditer(r'(?:\+?1[-.\s]?)?\(?[2-9]\d{2}\)?[-.\s]?\d{3}[-.\s]?\d{4}', full_text):
            clean_phones.add(p.group(0).strip())

        clean_emails = set(re.findall(email_pattern, full_text))

        entities_preview = []
        for p in extracted_persons:
            entities_preview.append({"label": "Person", "name": p, "type": "PERSON"})
        for o in extracted_orgs:
            entities_preview.append({"label": "Organization", "name": o, "type": "ORG"})
        for g in extracted_gpes:
            entities_preview.append({"label": "Location", "name": g, "type": "LOCATION"})

        committed_nodes = []
        pending_matches = []

        if auto_commit_entities:
            for p_name in extracted_persons:
                node = await graph_service.create_node(
                    label="Person",
                    properties={"full_name": p_name},
                    actor_id=actor_id,
                    case_id=case_id
                )
                committed_nodes.append(node)
                
                # Link Evidence -> Person (EVIDENCE_OF)
                await graph_service.create_relationship(
                    from_id=evidence_id,
                    to_id=node["id"],
                    rel_type="EVIDENCE_OF",
                    confidence=0.95,
                    source_ids=[evidence_id],
                    actor_id=actor_id,
                    method="inferred"
                )

                # Run Entity Resolution against existing entities
                matches = await er_service.run_resolution_for_entity(node["id"], case_id=case_id)
                pending_matches.extend(matches)

        return {
            "evidence_id": evidence_id,
            "filename": filename,
            "total_pages": len(doc),
            "text_snippet": full_text[:400],
            "extracted_entities": entities_preview,
            "extracted_phones": list(clean_phones),
            "extracted_emails": list(clean_emails),
            "committed_nodes_count": len(committed_nodes),
            "pending_matches_count": len(pending_matches)
        }

    async def ingest_csv_call_records(
        self,
        case_id: str,
        filename: str,
        csv_text: str,
        actor_id: str
    ) -> Dict[str, Any]:
        """
        Parses CSV call logs (Caller, Callee, Timestamp, Duration)
        Creates Person nodes and typed CONTACTS relationships.
        """
        import csv
        import io
        
        # Ingest as Evidence
        evidence = await self.ingest_file_as_evidence(
            case_id=case_id,
            filename=filename,
            file_bytes=csv_text.encode('utf-8'),
            evidence_type="document",
            actor_id=actor_id,
            title=f"Call Log: {filename}"
        )
        evidence_id = evidence["id"]

        reader = csv.DictReader(io.StringIO(csv_text))
        nodes_created = {}
        contacts_created = []

        for row in reader:
            caller_name = row.get("caller") or row.get("Caller") or row.get("from") or row.get("source")
            callee_name = row.get("callee") or row.get("Callee") or row.get("to") or row.get("target")
            timestamp = row.get("timestamp") or row.get("date") or datetime.now(timezone.utc).isoformat()
            duration = row.get("duration", "0")

            if not caller_name or not callee_name:
                continue

            # Get or create caller
            if caller_name not in nodes_created:
                c_node = await graph_service.create_node(
                    label="Person",
                    properties={"full_name": caller_name},
                    actor_id=actor_id,
                    case_id=case_id
                )
                nodes_created[caller_name] = c_node["id"]
                # Run ER
                await er_service.run_resolution_for_entity(c_node["id"], case_id=case_id)

            # Get or create callee
            if callee_name not in nodes_created:
                e_node = await graph_service.create_node(
                    label="Person",
                    properties={"full_name": callee_name},
                    actor_id=actor_id,
                    case_id=case_id
                )
                nodes_created[callee_name] = e_node["id"]
                # Run ER
                await er_service.run_resolution_for_entity(e_node["id"], case_id=case_id)

            caller_id = nodes_created[caller_name]
            callee_id = nodes_created[callee_name]

            # Create CONTACTS relationship edge
            edge = await graph_service.create_relationship(
                from_id=caller_id,
                to_id=callee_id,
                rel_type="CONTACTS",
                confidence=0.98,
                source_ids=[evidence_id],
                actor_id=actor_id,
                method="manual",
                properties={"timestamp": timestamp, "duration": duration}
            )
            contacts_created.append(edge)

        return {
            "evidence_id": evidence_id,
            "filename": filename,
            "entities_created": len(nodes_created),
            "contacts_relationships_created": len(contacts_created)
        }

ingestion_service = IngestionService()

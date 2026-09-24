import logging
from app.db.neo4j_client import graph_client
from app.services.graph_service import graph_service
from app.services.autonomous_research_service import auto_research_service

logger = logging.getLogger("constellation.seed")

async def seed_canonical_intelligence():
    """
    Seeds canonical intelligence for Case 102 (Silver Dune), Case 117, and Case 143.
    Ensures all graph queries, Byomkesh queries, and entity resolution routes
    have rich, authoritative graph entities and relationships.
    """
    try:
        actor_id = "usr_system_seed"

        # 1. Seed Cases
        cases = [
            {
                "id": "case-102",
                "label": "Case",
                "properties": {
                    "id": "case-102",
                    "title": "Case 102 — Silver Dune",
                    "description": "Cross-border maritime narcotics & hawala syndicate spanning Arabian Sea corridors into Gujarat and Mumbai.",
                    "legal_basis": "PMLA Sec 3/4 & NDPS Act Sec 21/29",
                    "status": "active"
                }
            },
            {
                "id": "case-117",
                "label": "Case",
                "properties": {
                    "id": "case-117",
                    "title": "Case 117 — Operation Black Tide",
                    "description": "Inter-state maritime trafficking nexus with deep sea transshipment points.",
                    "legal_basis": "NDPS Act Sec 21/29 & UAPA Sec 15",
                    "status": "active"
                }
            },
            {
                "id": "case-143",
                "label": "Case",
                "properties": {
                    "id": "case-143",
                    "title": "Case 143 — Red Sand Syndicate",
                    "description": "Smuggling & illicit financial settlement network operating via maritime brokers.",
                    "legal_basis": "IPC Sec 370 / Passports Act",
                    "status": "active"
                }
            }
        ]

        for c in cases:
            await graph_client.create_node(
                label=c["label"],
                node_id=c["id"],
                properties=c["properties"],
                case_id=c["id"]
            )

        # 2. Seed Entities for Case 102
        entities = [
            {
                "id": "p-1",
                "label": "Person",
                "properties": {
                    "id": "p-1",
                    "name": "Tariq \"The Anchor\" Merchant",
                    "full_name": "Tariq Merchant",
                    "role": "Syndicate Coordinator",
                    "threat": "CRITICAL",
                    "risk": "Critical",
                    "provenance": "INFERENCE",
                    "phone": "+971-50-882-991",
                    "location": "Dubai / Mumbai",
                    "details": "Identified via wiretap transcript #WT-882 coordinating transshipment logistics off Gujarat coast."
                }
            },
            {
                "id": "p-2",
                "label": "Person",
                "properties": {
                    "id": "p-2",
                    "name": "Rajesh Sharma",
                    "full_name": "Rajesh Sharma",
                    "role": "Charter Broker",
                    "threat": "HIGH",
                    "risk": "High",
                    "provenance": "OBSERVATION",
                    "phone": "+91-98201-9921",
                    "location": "Surat, Gujarat",
                    "details": "Acts as local charter broker facilitating cargo documentation and customs clearance."
                }
            },
            {
                "id": "p-3",
                "label": "Person",
                "properties": {
                    "id": "p-3",
                    "name": "Captain Al-Sayed",
                    "full_name": "Captain Al-Sayed",
                    "role": "Vessel Master (MV Sagar Ratna)",
                    "threat": "MEDIUM",
                    "risk": "Medium",
                    "provenance": "RAW DATA",
                    "phone": "+968-9122-384",
                    "location": "At Sea",
                    "details": "Master of bulk carrier MV Sagar Ratna during suspicious Arabian Sea blackout period."
                }
            },
            {
                "id": "p-4",
                "label": "Person",
                "properties": {
                    "id": "p-4",
                    "name": "Nadia Chen",
                    "full_name": "Nadia Chen",
                    "role": "Financial Broker",
                    "threat": "HIGH",
                    "risk": "High",
                    "provenance": "CORRELATION",
                    "phone": "+852-9102-441",
                    "location": "Hong Kong / Dubai",
                    "details": "Coordinates escrow accounts linked to Al-Barakah shell entities."
                }
            },
            {
                "id": "org-1",
                "label": "Organization",
                "properties": {
                    "id": "org-1",
                    "name": "Al-Barakah Logistics FZE",
                    "full_name": "Al-Barakah Logistics FZE",
                    "role": "Shell Charterer (Dubai)",
                    "threat": "HIGH",
                    "risk": "High",
                    "provenance": "INFERENCE",
                    "jurisdiction": "Dubai, UAE",
                    "address": "JAFZA Zone 4, Dubai",
                    "details": "Incorporated in JAFZA free zone with no verifiable physical warehouse footprint."
                }
            },
            {
                "id": "org-2",
                "label": "Organization",
                "properties": {
                    "id": "org-2",
                    "name": "Vikramaditya Shipping Lines",
                    "full_name": "Vikramaditya Shipping Lines",
                    "role": "Maritime Freight Operator",
                    "threat": "MEDIUM",
                    "risk": "Medium",
                    "provenance": "RAW DATA",
                    "jurisdiction": "Mumbai, India",
                    "address": "Nariman Point, Mumbai",
                    "details": "Domestic shipping operator chartered by Al-Barakah for coastal freight."
                }
            },
            {
                "id": "veh-1",
                "label": "Vehicle",
                "properties": {
                    "id": "veh-1",
                    "name": "MV Sagar Ratna (IMO 921882)",
                    "full_name": "MV Sagar Ratna",
                    "role": "Bulk Cargo Carrier",
                    "threat": "HIGH",
                    "risk": "High",
                    "provenance": "RAW DATA",
                    "flag": "Panama",
                    "details": "AIS transponder deactivated for 31 hours while in international waters off Arabian Sea."
                }
            },
            {
                "id": "fin-1",
                "label": "Financial",
                "properties": {
                    "id": "fin-1",
                    "name": "Hawala Account #88219",
                    "full_name": "Hawala Account #88219",
                    "role": "Illicit Value Transfer Mirror",
                    "threat": "CRITICAL",
                    "risk": "Critical",
                    "provenance": "CORRELATION",
                    "bank": "Emirates National Mirror Ledger",
                    "details": "Structured transfer of ₹14.8 Crore matching narcotics courier payment timestamps."
                }
            },
            {
                "id": "loc-1",
                "label": "Location",
                "properties": {
                    "id": "loc-1",
                    "name": "Port of Kandla (Berth 4)",
                    "full_name": "Port of Kandla (Terminal 4)",
                    "role": "Primary Offloading Site",
                    "threat": "LOW",
                    "risk": "Low",
                    "provenance": "RAW DATA",
                    "country": "India",
                    "details": "Physical maritime berth where nocturnal unmanifested offload was captured on CCTV."
                }
            }
        ]

        for e in entities:
            await graph_client.create_node(
                label=e["label"],
                node_id=e["id"],
                properties=e["properties"],
                case_id="case-102"
            )

        # 3. Seed Relationships for Case 102
        relationships = [
            ("edge-1", "p-1", "org-1", "BENEFICIAL_OWNER", 0.94, ["evd-3"], "Cross-border shell analysis"),
            ("edge-2", "p-1", "p-2", "COMMUNICATES_WITH", 0.88, ["evd-satellite"], "Thuraya phone intercepts"),
            ("edge-3", "org-1", "fin-1", "FUNDS_TRANSFERRED", 0.97, ["evd-wire-ledger"], "SWIFT & ledger audit"),
            ("edge-4", "p-2", "fin-1", "AUTHORIZED_SIGNATORY", 0.91, ["evd-fiu-report"], "Bank signature card match"),
            ("edge-5", "org-1", "veh-1", "CHARTERS_VESSEL", 0.95, ["evd-charter-doc"], "Voyage charter agreement"),
            ("edge-6", "veh-1", "loc-1", "DOCKED_AT", 0.99, ["evd-port-log"], "Port AIS and berth log"),
            ("edge-7", "p-3", "veh-1", "COMMANDS", 0.98, ["evd-crew-manifest"], "Crew manifest verification")
        ]

        for rel_id, src, dst, r_type, conf, sources, method in relationships:
            await graph_client.create_relationship(
                rel_id=rel_id,
                from_id=src,
                to_id=dst,
                rel_type=r_type,
                confidence=conf,
                source_ids=sources,
                method=method,
                created_at="2026-09-23T12:00:00Z"
            )

        # 4. Seed Canonical Hypotheses
        hypotheses = [
            {
                "statement": "Tariq Merchant utilizes Al-Barakah Logistics as an offshore shell to orchestrate Arabian Sea narcotics shipments masked as industrial gypsum.",
                "confidence": 0.89,
                "supporting_evidence_ids": ["evd-1", "evd-3"]
            },
            {
                "statement": "Hawala node #88219 acts as the primary laundering bridge between Dubai export accounts and Surat diamond brokers.",
                "confidence": 0.92,
                "supporting_evidence_ids": ["evd-3"]
            }
        ]

        for h in hypotheses:
            await auto_research_service.create_hypothesis(
                case_id="case-102",
                statement=h["statement"],
                confidence=h["confidence"],
                supporting_evidence_ids=h["supporting_evidence_ids"],
                contradicting_evidence_ids=[],
                actor_id=actor_id
            )

        logger.info("Successfully seeded canonical intelligence for Case 102!")
    except Exception as e:
        logger.error(f"Error seeding canonical intelligence: {e}")

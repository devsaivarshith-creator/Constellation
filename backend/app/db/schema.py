"""
Neo4j Property Graph Schema Definitions, Constraints, and Indexes for Constellation.
Phase 1 Scope:
- 12 Node Label Groups:
    Case, Person, Identity, Communication, FinancialTransaction,
    Organization, Location, Vehicle, Event, Evidence, Legal, Relationship
- Typed Relationships:
    OWNS, CONTACTS, TRANSFERS_TO, LOCATED_AT, ASSOCIATED_WITH,
    EVIDENCE_OF, CONTRADICTED_BY, PART_OF, REPORTED_AT,
    COMMUNICATES_WITH, IDENTIFIED_BY, DRIVES, ATTENDED,
    EMPLOYED_BY, AUTHORIZED_BY, LINKED_TO_CASE
"""

SCHEMA_CONSTRAINTS = [
    # Primary Key Uniqueness
    "CREATE CONSTRAINT case_id_unique IF NOT EXISTS FOR (c:Case) REQUIRE c.id IS UNIQUE",
    "CREATE CONSTRAINT person_id_unique IF NOT EXISTS FOR (p:Person) REQUIRE p.id IS UNIQUE",
    "CREATE CONSTRAINT identity_id_unique IF NOT EXISTS FOR (i:Identity) REQUIRE i.id IS UNIQUE",
    "CREATE CONSTRAINT communication_id_unique IF NOT EXISTS FOR (cm:Communication) REQUIRE cm.id IS UNIQUE",
    "CREATE CONSTRAINT financial_id_unique IF NOT EXISTS FOR (f:FinancialTransaction) REQUIRE f.id IS UNIQUE",
    "CREATE CONSTRAINT organization_id_unique IF NOT EXISTS FOR (o:Organization) REQUIRE o.id IS UNIQUE",
    "CREATE CONSTRAINT location_id_unique IF NOT EXISTS FOR (l:Location) REQUIRE l.id IS UNIQUE",
    "CREATE CONSTRAINT vehicle_id_unique IF NOT EXISTS FOR (v:Vehicle) REQUIRE v.id IS UNIQUE",
    "CREATE CONSTRAINT event_id_unique IF NOT EXISTS FOR (e:Event) REQUIRE e.id IS UNIQUE",
    "CREATE CONSTRAINT evidence_id_unique IF NOT EXISTS FOR (ev:Evidence) REQUIRE ev.id IS UNIQUE",
    "CREATE CONSTRAINT legal_id_unique IF NOT EXISTS FOR (lg:Legal) REQUIRE lg.id IS UNIQUE",
    "CREATE CONSTRAINT relationship_id_unique IF NOT EXISTS FOR (r:Relationship) REQUIRE r.id IS UNIQUE",

    # Key Property Existence & Search Indexes
    "CREATE INDEX person_name_idx IF NOT EXISTS FOR (p:Person) ON (p.full_name)",
    "CREATE INDEX identity_value_idx IF NOT EXISTS FOR (i:Identity) ON (i.value)",
    "CREATE INDEX evidence_hash_idx IF NOT EXISTS FOR (ev:Evidence) ON (ev.file_hash)",
    "CREATE INDEX event_time_idx IF NOT EXISTS FOR (e:Event) ON (e.timestamp)",
    "CREATE INDEX case_status_idx IF NOT EXISTS FOR (c:Case) ON (c.status)"
]

async def apply_neo4j_schema(driver):
    """Executes constraints and index declarations against Neo4j."""
    async with driver.session() as session:
        for statement in SCHEMA_CONSTRAINTS:
            try:
                await session.run(statement)
            except Exception as e:
                # Log or tolerate if already exists or community limits
                print(f"[Schema] Note applying '{statement}': {e}")

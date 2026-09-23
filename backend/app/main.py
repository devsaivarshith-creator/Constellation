from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.config import settings
from app.db.sqlite_client import init_sqlite_db
from app.dependencies import create_initial_users
from app.db.neo4j_client import graph_client
from app.routers import (
    auth, cases, entities, relationships,
    ingestion, entity_resolution, evidence, byomkesh, audit,
    home, hypotheses, sweep
)

@asynccontextmanager
async def lifespan(app: FastAPI):
    # 1. Initialize SQLite tables (users, audit ledger, ER matches, evidence)
    init_sqlite_db()
    # 2. Seed initial users (admin, investigator, analyst)
    create_initial_users()
    # 3. Connect to Graph (Neo4j with resilient fallback)
    await graph_client.connect()
    # 4. Seed Canonical Intelligence (Case 102, 117, 143 entities & edges)
    from app.db.seed_data import seed_canonical_intelligence
    await seed_canonical_intelligence()
    
    yield
    
    # Graceful shutdown
    await graph_client.close()

app = FastAPI(
    title=settings.APP_NAME,
    version=settings.APP_VERSION,
    description="Multi-agent, multi-layer investigative intelligence platform (Phase 1 MVP)",
    lifespan=lifespan
)

# CORS configuration for frontend development
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include API Routers
app.include_router(auth.router, prefix="/api")
app.include_router(cases.router, prefix="/api")
app.include_router(entities.router, prefix="/api")
app.include_router(relationships.router, prefix="/api")
app.include_router(ingestion.router, prefix="/api")
app.include_router(entity_resolution.router, prefix="/api")
app.include_router(evidence.router, prefix="/api")
app.include_router(byomkesh.router, prefix="/api")
app.include_router(audit.router, prefix="/api")
app.include_router(home.router, prefix="/api")
app.include_router(hypotheses.router, prefix="/api")
app.include_router(sweep.router, prefix="/api")

@app.get("/api/health")
async def health_check():
    return {
        "status": "healthy",
        "app": settings.APP_NAME,
        "version": settings.APP_VERSION,
        "graph_backend": "Neo4j" if graph_client.is_connected else "Embedded Resilience Engine"
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app.main:app", host="0.0.0.0", port=8000, reload=True)

"""
The main application - the heartbeat of the system.
"""
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from confluence.config import settings

# Initialize the heart
app = FastAPI(
    title="Confluence API",
    description="Where rivers meet. The computational heart of unity.",
    version="0.1.0",
)

# Allow the frontend to communicate - the bridge between worlds
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/")
async def root() -> JSONResponse:
    """The beginning - a simple truth."""
    return JSONResponse(
        content={
            "message": "Confluence is breathing",
            "philosophy": "Where rivers meet. Where disciplines dissolve.",
            "status": "alive",
        }
    )


@app.get("/health")
async def health() -> JSONResponse:
    """Check the pulse of the system."""
    return JSONResponse(
        content={
            "status": "healthy",
            "heartbeat": True,
        }
    )


# Future routers will branch from here like tributaries:
# app.include_router(data_router, prefix="/api/data", tags=["data"])
# app.include_router(ai_router, prefix="/api/ai", tags=["ai"])
# app.include_router(harmony_router, prefix="/api/harmony", tags=["harmony"])

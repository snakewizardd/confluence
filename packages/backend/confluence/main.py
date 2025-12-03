"""
The main application - the heartbeat of the system.
"""
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from confluence.config import settings
from confluence.routers.iris import router as iris_router
from confluence.routers.spectrum import router as spectrum_router
from confluence.routers.loom import router as loom_router

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
    """
    Check the pulse of the system.
    Returns health status of all services.
    """
    # TODO: Add actual service checks (database, redis, R engine)
    return JSONResponse(
        content={
            "status": "ok",
            "services": {
                "api": "ok",
                "r": "ok",  # In future: check R engine availability
                # "database": "ok",  # When database is added
                # "redis": "ok",     # When redis is added
            },
            "timestamp": "2025-12-03T00:00:00Z",  # TODO: Use actual timestamp
        }
    )


@app.get("/api/info")
async def info() -> JSONResponse:
    """
    Returns API version and available endpoints.
    Useful for client discovery and debugging.
    """
    return JSONResponse(
        content={
            "name": "Confluence API",
            "version": "0.1.0",
            "description": "Where rivers meet. The computational heart of unity.",
            "endpoints": [
                {"path": "/", "method": "GET", "description": "Root endpoint"},
                {"path": "/health", "method": "GET", "description": "Health check"},
                {"path": "/api/info", "method": "GET", "description": "API information"},
                {"path": "/api/iris", "method": "GET", "description": "Iris dataset operations"},
                {"path": "/docs", "method": "GET", "description": "OpenAPI documentation"},
            ],
            "philosophy": "Data as a living entity - transforming numbers into sight and sound",
        }
    )


# Routers branch from here like tributaries:
app.include_router(iris_router)
app.include_router(spectrum_router)
app.include_router(loom_router)

# Future routers:
# app.include_router(data_router, prefix="/api/data", tags=["data"])
# app.include_router(harmony_router, prefix="/api/harmony", tags=["harmony"])

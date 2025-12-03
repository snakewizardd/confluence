"""
Loom router - Generative mathematical sonification
Where mathematics dreams in sound, where formulas become music
"""
import json
import logging
import subprocess
from pathlib import Path
from typing import Any, Dict, Optional

from fastapi import APIRouter, HTTPException
from fastapi.responses import JSONResponse
from pydantic import BaseModel

# Configure logging
logger = logging.getLogger(__name__)

# The loom router - weaving mathematics into perception
router = APIRouter(prefix="/api/loom", tags=["loom"])

# Path to the R script - the mathematical dream engine
R_SCRIPT_PATH = Path(__file__).parent.parent.parent / "r_scripts" / "loom_generators.R"


class LoomRequest(BaseModel):
    """Request model for loom generation."""
    system: str  # "lorenz" | "automaton" | "fibonacci" | "clifford"
    params: Optional[Dict[str, Any]] = None


@router.get("/health")
async def loom_health() -> JSONResponse:
    """Check if the loom system is alive."""
    return JSONResponse(
        content={
            "status": "alive",
            "module": "loom",
            "description": "Generative mathematical sonification engine",
            "systems": ["lorenz", "automaton", "fibonacci", "clifford"],
            "r_script_exists": R_SCRIPT_PATH.exists(),
        }
    )


@router.post("/generate")
async def generate_loom(request: LoomRequest) -> JSONResponse:
    """
    Generate a mathematical system for sonification.

    Supports four systems:
    - lorenz: Chaotic attractor (chaos theory)
    - automaton: Cellular automaton (Rule 110, Turing complete)
    - fibonacci: Fibonacci spiral (golden ratio harmonics)
    - clifford: Strange attractor (infinite parameter space)

    Args:
        request: LoomRequest with system type and optional parameters

    Returns:
        JSONResponse: Generated mathematical data ready for sonification

    Raises:
        HTTPException: If R script fails or produces invalid output
    """
    logger.info(f"Loom generation requested: {request.system}")

    # Verify R script exists
    if not R_SCRIPT_PATH.exists():
        logger.error(f"R script not found at {R_SCRIPT_PATH}")
        raise HTTPException(
            status_code=500,
            detail=f"R script not found at {R_SCRIPT_PATH}"
        )

    # Validate system type
    valid_systems = ["lorenz", "automaton", "fibonacci", "clifford"]
    if request.system not in valid_systems:
        raise HTTPException(
            status_code=400,
            detail=f"Invalid system. Must be one of: {', '.join(valid_systems)}"
        )

    try:
        # Prepare JSON input for R script
        input_data = {
            "system": request.system,
            "params": request.params or {}
        }
        input_json = json.dumps(input_data)

        # Execute the R script with JSON input via stdin
        logger.info(f"Executing R script for {request.system}...")
        result = subprocess.run(
            ["Rscript", str(R_SCRIPT_PATH)],
            input=input_json,
            capture_output=True,
            text=True,
            timeout=30,  # 30 second timeout
            check=False,
        )

        logger.info(f"R script completed - Return code: {result.returncode}")

        if result.stderr:
            logger.warning(f"R script stderr: {result.stderr}")

        # Check for R execution errors
        if result.returncode != 0:
            error_msg = result.stderr or "Unknown R error"
            logger.error(f"R script execution failed: {error_msg}")
            raise HTTPException(
                status_code=500,
                detail=f"R script execution failed: {error_msg}"
            )

        # Parse the JSON output from R
        try:
            data = json.loads(result.stdout)
            logger.info("Successfully parsed R output as JSON")
        except json.JSONDecodeError as e:
            logger.error(f"Failed to parse R output as JSON: {str(e)}")
            logger.error(f"R output preview: {result.stdout[:500]}")
            raise HTTPException(
                status_code=500,
                detail=f"Failed to parse R output as JSON: {str(e)}"
            )

        # Check for error in R output
        if isinstance(data, dict) and data.get("error"):
            raise HTTPException(
                status_code=500,
                detail=f"R script error: {data.get('message', 'Unknown error')}"
            )

        # Return the loom data
        logger.info(f"Returning {request.system} data")
        return JSONResponse(content=data)

    except subprocess.TimeoutExpired:
        logger.error("R script execution timed out after 30 seconds")
        raise HTTPException(
            status_code=504,
            detail="R script execution timed out after 30 seconds"
        )
    except FileNotFoundError:
        logger.error("Rscript command not found - R may not be installed")
        raise HTTPException(
            status_code=500,
            detail="Rscript command not found. Is R installed?"
        )
    except Exception as e:
        logger.error(f"Unexpected error during loom generation: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail=f"Unexpected error during loom generation: {str(e)}"
        )


@router.get("/demo")
async def demo_loom() -> JSONResponse:
    """
    Run loom generation in demo mode (Lorenz attractor).

    Useful for testing the pipeline without providing parameters.

    Returns:
        JSONResponse: Lorenz attractor data
    """
    logger.info("Demo loom generation requested")

    # Verify R script exists
    if not R_SCRIPT_PATH.exists():
        logger.error(f"R script not found at {R_SCRIPT_PATH}")
        raise HTTPException(
            status_code=500,
            detail=f"R script not found at {R_SCRIPT_PATH}"
        )

    try:
        # Execute R script with no input (triggers demo mode)
        logger.info("Executing R script in demo mode...")
        result = subprocess.run(
            ["Rscript", str(R_SCRIPT_PATH)],
            capture_output=True,
            text=True,
            timeout=30,
            check=False,
        )

        logger.info(f"R script completed - Return code: {result.returncode}")

        if result.returncode != 0:
            error_msg = result.stderr or "Unknown R error"
            logger.error(f"R script execution failed: {error_msg}")
            raise HTTPException(
                status_code=500,
                detail=f"R script execution failed: {error_msg}"
            )

        # Parse the JSON output
        try:
            data = json.loads(result.stdout)
            logger.info("Successfully parsed R output as JSON")
        except json.JSONDecodeError as e:
            logger.error(f"Failed to parse R output as JSON: {str(e)}")
            raise HTTPException(
                status_code=500,
                detail=f"Failed to parse R output as JSON: {str(e)}"
            )

        logger.info("Returning demo loom data")
        return JSONResponse(content=data)

    except subprocess.TimeoutExpired:
        logger.error("R script execution timed out after 30 seconds")
        raise HTTPException(
            status_code=504,
            detail="R script execution timed out after 30 seconds"
        )
    except Exception as e:
        logger.error(f"Unexpected error during demo generation: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail=f"Unexpected error during demo generation: {str(e)}"
        )


@router.get("/systems")
async def list_systems() -> JSONResponse:
    """
    List all available mathematical systems with descriptions.

    Returns:
        JSONResponse: Array of system metadata
    """
    systems = [
        {
            "id": "lorenz",
            "name": "Lorenz Attractor",
            "description": "The butterfly's wing. Deterministic chaos—predictable yet unknowable.",
            "category": "chaos",
            "params": {
                "n": {"type": "int", "default": 2000, "min": 100, "max": 10000},
                "dt": {"type": "float", "default": 0.01, "min": 0.001, "max": 0.1},
                "sigma": {"type": "float", "default": 10, "min": 1, "max": 20},
                "rho": {"type": "float", "default": 28, "min": 1, "max": 50},
                "beta": {"type": "float", "default": 2.667, "min": 0.5, "max": 5}
            }
        },
        {
            "id": "automaton",
            "name": "Cellular Automaton",
            "description": "Simple rules, emergent complexity. The flamenco of logic.",
            "category": "discrete",
            "params": {
                "rule": {"type": "int", "default": 110, "min": 0, "max": 255},
                "width": {"type": "int", "default": 64, "min": 16, "max": 128},
                "generations": {"type": "int", "default": 64, "min": 16, "max": 128}
            }
        },
        {
            "id": "fibonacci",
            "name": "Fibonacci Spiral",
            "description": "Nature's favorite number. Shells, galaxies, your heartbeat.",
            "category": "harmony",
            "params": {
                "n": {"type": "int", "default": 144, "min": 10, "max": 500}
            }
        },
        {
            "id": "clifford",
            "name": "Clifford Attractor",
            "description": "Four numbers, infinite beauty. Adjust and discover.",
            "category": "strange",
            "params": {
                "n": {"type": "int", "default": 5000, "min": 100, "max": 20000},
                "a": {"type": "float", "default": -1.4, "min": -3, "max": 3},
                "b": {"type": "float", "default": 1.6, "min": -3, "max": 3},
                "c": {"type": "float", "default": 1.0, "min": -3, "max": 3},
                "d": {"type": "float", "default": 0.7, "min": -3, "max": 3}
            }
        }
    ]

    return JSONResponse(content={"systems": systems})

"""
Iris router - Fisher's 1936 dataset transformed into sound and waves
Where statistics meets soul, where data becomes music
"""
import json
import subprocess
import os
from pathlib import Path
from typing import Any, Dict

from fastapi import APIRouter, HTTPException
from fastapi.responses import JSONResponse

# The iris router - a tributary of the main API
router = APIRouter(prefix="/api/iris", tags=["iris"])

# Path to the R script - the transformation engine
R_SCRIPT_PATH = Path(__file__).parent.parent.parent / "r_scripts" / "iris_transform.R"


@router.get("/health")
async def iris_health() -> JSONResponse:
    """Check if the iris transformation system is alive."""
    return JSONResponse(
        content={
            "status": "alive",
            "dataset": "iris",
            "year": 1936,
            "author": "R.A. Fisher",
            "r_script_exists": R_SCRIPT_PATH.exists(),
        }
    )


@router.get("/data")
async def get_iris_data() -> JSONResponse:
    """
    Transform the iris dataset into sinusoidal waves.

    Runs the R script that:
    1. Loads Fisher's 1936 iris dataset
    2. Normalizes all measurements to [0,1]
    3. Generates sinusoidal waves with harmonics
    4. Returns JSON with waves, statistics, and metadata

    Returns:
        JSONResponse: Complete iris transformation data

    Raises:
        HTTPException: If R script fails or produces invalid output
    """
    # Verify R script exists
    if not R_SCRIPT_PATH.exists():
        raise HTTPException(
            status_code=500,
            detail=f"R script not found at {R_SCRIPT_PATH}"
        )

    try:
        # Execute the R script - invoke the transformation
        result = subprocess.run(
            ["Rscript", str(R_SCRIPT_PATH)],
            capture_output=True,
            text=True,
            timeout=30,  # 30 second timeout
            check=False,
        )

        # Check for R execution errors
        if result.returncode != 0:
            error_msg = result.stderr or "Unknown R error"
            raise HTTPException(
                status_code=500,
                detail=f"R script execution failed: {error_msg}"
            )

        # Parse the JSON output from R
        try:
            data = json.loads(result.stdout)
        except json.JSONDecodeError as e:
            raise HTTPException(
                status_code=500,
                detail=f"Failed to parse R output as JSON: {str(e)}"
            )

        # Return the transformed data
        return JSONResponse(content=data)

    except subprocess.TimeoutExpired:
        raise HTTPException(
            status_code=504,
            detail="R script execution timed out after 30 seconds"
        )
    except FileNotFoundError:
        raise HTTPException(
            status_code=500,
            detail="Rscript command not found. Is R installed?"
        )
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Unexpected error during iris transformation: {str(e)}"
        )

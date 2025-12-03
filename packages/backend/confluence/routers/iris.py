"""
Iris router - Fisher's 1936 dataset transformed into sound and waves
Where statistics meets soul, where data becomes music
"""
import json
import logging
import subprocess
import os
from pathlib import Path
from typing import Any, Dict

from fastapi import APIRouter, HTTPException
from fastapi.responses import JSONResponse

# Configure logging
logger = logging.getLogger(__name__)

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


@router.get("/test")
async def test_r_availability() -> JSONResponse:
    """
    Test if R is available and can be executed.

    Returns:
        JSONResponse: R availability status and version information
    """
    try:
        # Try to get R version
        result = subprocess.run(
            ["Rscript", "--version"],
            capture_output=True,
            text=True,
            timeout=5,
            check=False,
        )

        if result.returncode == 0:
            # R is available - extract version from stderr (R writes version info there)
            version_output = result.stderr.strip()
            # Extract just the version number if possible
            version = version_output.split('\n')[0] if version_output else "unknown"

            return JSONResponse(
                content={
                    "r_available": True,
                    "version": version,
                    "status": "R engine operational"
                }
            )
        else:
            return JSONResponse(
                content={
                    "r_available": False,
                    "version": None,
                    "status": "R command failed",
                    "error": result.stderr
                }
            )

    except FileNotFoundError:
        return JSONResponse(
            content={
                "r_available": False,
                "version": None,
                "status": "Rscript command not found - R may not be installed"
            }
        )
    except Exception as e:
        return JSONResponse(
            content={
                "r_available": False,
                "version": None,
                "status": f"Error testing R: {str(e)}"
            }
        )


@router.get("/debug")
async def debug_iris_pipeline() -> JSONResponse:
    """
    Comprehensive diagnostic endpoint for debugging the iris pipeline.

    Tests every component of the iris transformation system and returns
    detailed status information to help diagnose issues.

    Returns:
        JSONResponse: Diagnostic information about the entire pipeline
    """
    diagnostics = {}

    # 1. Check R script path and existence
    diagnostics["r_script_path"] = str(R_SCRIPT_PATH)
    diagnostics["r_script_exists"] = R_SCRIPT_PATH.exists()
    diagnostics["r_script_absolute_path"] = str(R_SCRIPT_PATH.resolve())

    # 2. Check if R is installed
    try:
        r_version_result = subprocess.run(
            ["Rscript", "--version"],
            capture_output=True,
            text=True,
            timeout=5,
            check=False,
        )
        diagnostics["r_installed"] = r_version_result.returncode == 0
        diagnostics["r_version"] = r_version_result.stderr.strip().split('\n')[0] if r_version_result.returncode == 0 else None
    except FileNotFoundError:
        diagnostics["r_installed"] = False
        diagnostics["r_version"] = None
    except Exception as e:
        diagnostics["r_installed"] = False
        diagnostics["r_version"] = None
        diagnostics["r_check_error"] = str(e)

    # 3. Check if jsonlite is installed
    try:
        jsonlite_check = subprocess.run(
            ["Rscript", "-e", "library(jsonlite); cat('OK')"],
            capture_output=True,
            text=True,
            timeout=5,
            check=False,
        )
        diagnostics["jsonlite_installed"] = jsonlite_check.returncode == 0 and "OK" in jsonlite_check.stdout
    except Exception as e:
        diagnostics["jsonlite_installed"] = False
        diagnostics["jsonlite_check_error"] = str(e)

    # 4. Test R script execution (if script exists and R is installed)
    if diagnostics["r_script_exists"] and diagnostics["r_installed"]:
        try:
            test_result = subprocess.run(
                ["Rscript", str(R_SCRIPT_PATH)],
                capture_output=True,
                text=True,
                timeout=10,
                check=False,
            )
            diagnostics["test_execution_returncode"] = test_result.returncode
            diagnostics["test_execution_success"] = test_result.returncode == 0

            if test_result.returncode == 0:
                # Try to parse output
                try:
                    json.loads(test_result.stdout)
                    diagnostics["test_output_valid_json"] = True
                    diagnostics["test_output_preview"] = test_result.stdout[:200] + "..." if len(test_result.stdout) > 200 else test_result.stdout
                except json.JSONDecodeError:
                    diagnostics["test_output_valid_json"] = False
                    diagnostics["test_output_preview"] = test_result.stdout[:200]
            else:
                diagnostics["test_output_valid_json"] = False
                diagnostics["test_error"] = test_result.stderr
                diagnostics["test_output_preview"] = test_result.stdout[:200] if test_result.stdout else None

        except subprocess.TimeoutExpired:
            diagnostics["test_execution_success"] = False
            diagnostics["test_error"] = "Execution timed out after 10 seconds"
        except Exception as e:
            diagnostics["test_execution_success"] = False
            diagnostics["test_error"] = str(e)
    else:
        diagnostics["test_execution_success"] = False
        diagnostics["test_error"] = "Cannot test - script doesn't exist or R not installed"

    # 5. Overall status
    diagnostics["pipeline_ready"] = (
        diagnostics["r_script_exists"] and
        diagnostics["r_installed"] and
        diagnostics.get("jsonlite_installed", False) and
        diagnostics.get("test_execution_success", False)
    )

    return JSONResponse(content=diagnostics)


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
    logger.info(f"Iris data requested - R script path: {R_SCRIPT_PATH}")
    logger.info(f"R script exists: {R_SCRIPT_PATH.exists()}")

    # Verify R script exists
    if not R_SCRIPT_PATH.exists():
        logger.error(f"R script not found at {R_SCRIPT_PATH}")
        raise HTTPException(
            status_code=500,
            detail=f"R script not found at {R_SCRIPT_PATH}"
        )

    try:
        # Execute the R script - invoke the transformation
        logger.info("Executing R script...")
        result = subprocess.run(
            ["Rscript", str(R_SCRIPT_PATH)],
            capture_output=True,
            text=True,
            timeout=30,  # 30 second timeout
            check=False,
        )

        logger.info(f"R script completed - Return code: {result.returncode}")
        logger.info(f"Stdout length: {len(result.stdout)} chars")
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
            logger.error(f"R output preview: {result.stdout[:200]}")
            raise HTTPException(
                status_code=500,
                detail=f"Failed to parse R output as JSON: {str(e)}"
            )

        # Return the transformed data
        logger.info("Returning iris transformation data")
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
        logger.error(f"Unexpected error during iris transformation: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail=f"Unexpected error during iris transformation: {str(e)}"
        )

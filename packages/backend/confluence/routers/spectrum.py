"""
Spectrum router - Fourier transform and spectral sonification
Where hidden frequencies become audible, where cycles emerge from noise
"""
import json
import logging
import subprocess
from pathlib import Path
from typing import Any, Dict, List, Optional

from fastapi import APIRouter, HTTPException
from fastapi.responses import JSONResponse
from pydantic import BaseModel

# Configure logging
logger = logging.getLogger(__name__)

# The spectrum router - revealing hidden periodicities
router = APIRouter(prefix="/api/spectrum", tags=["spectrum"])

# Path to the R script - the frequency extraction engine
R_SCRIPT_PATH = Path(__file__).parent.parent.parent / "r_scripts" / "spectral_analysis.R"


class SpectrumRequest(BaseModel):
    """Request model for spectrum analysis."""
    series: Optional[List[float]] = None
    series1: Optional[List[float]] = None
    series2: Optional[List[float]] = None
    sample_rate: Optional[float] = 1.0
    n_peaks: Optional[int] = 8


@router.get("/health")
async def spectrum_health() -> JSONResponse:
    """Check if the spectral analysis system is alive."""
    return JSONResponse(
        content={
            "status": "alive",
            "module": "spectral_sonification",
            "description": "Fourier transform and frequency extraction",
            "r_script_exists": R_SCRIPT_PATH.exists(),
        }
    )


@router.post("/analyze")
async def analyze_spectrum(request: SpectrumRequest) -> JSONResponse:
    """
    Analyze spectral content of time series data.

    Performs FFT with proper windowing, extracts dominant frequencies,
    computes spectral statistics (centroid, entropy, rolloff).

    For single series: provide 'series' parameter
    For cross-spectral analysis: provide 'series1' and 'series2'

    Args:
        request: SpectrumRequest with time series data

    Returns:
        JSONResponse: Spectral components, metadata, and full spectrum

    Raises:
        HTTPException: If R script fails or produces invalid output
    """
    logger.info("Spectrum analysis requested")

    # Verify R script exists
    if not R_SCRIPT_PATH.exists():
        logger.error(f"R script not found at {R_SCRIPT_PATH}")
        raise HTTPException(
            status_code=500,
            detail=f"R script not found at {R_SCRIPT_PATH}"
        )

    # Validate input
    if request.series is None and (request.series1 is None or request.series2 is None):
        raise HTTPException(
            status_code=400,
            detail="Must provide either 'series' or both 'series1' and 'series2'"
        )

    if request.series is not None and len(request.series) < 4:
        raise HTTPException(
            status_code=400,
            detail="Series must contain at least 4 data points for FFT"
        )

    if request.series1 is not None and len(request.series1) < 4:
        raise HTTPException(
            status_code=400,
            detail="Series1 must contain at least 4 data points for FFT"
        )

    if request.series2 is not None and len(request.series2) < 4:
        raise HTTPException(
            status_code=400,
            detail="Series2 must contain at least 4 data points for FFT"
        )

    try:
        # Prepare JSON input for R script
        input_data = {}
        if request.series is not None:
            input_data["series"] = request.series
        if request.series1 is not None:
            input_data["series1"] = request.series1
        if request.series2 is not None:
            input_data["series2"] = request.series2
        input_data["sample_rate"] = request.sample_rate
        input_data["n_peaks"] = request.n_peaks

        input_json = json.dumps(input_data)

        # Execute the R script with JSON input via stdin
        logger.info("Executing R script for spectral analysis...")
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

        # Return the spectral analysis data
        logger.info("Returning spectral analysis data")
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
        logger.error(f"Unexpected error during spectral analysis: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail=f"Unexpected error during spectral analysis: {str(e)}"
        )


@router.get("/demo")
async def demo_spectrum() -> JSONResponse:
    """
    Run spectral analysis on a demo signal (sine waves + noise).

    Useful for testing the pipeline without providing data.

    Returns:
        JSONResponse: Spectral analysis of synthetic signal
    """
    logger.info("Demo spectrum analysis requested")

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

        logger.info("Returning demo spectral analysis data")
        return JSONResponse(content=data)

    except subprocess.TimeoutExpired:
        logger.error("R script execution timed out after 30 seconds")
        raise HTTPException(
            status_code=504,
            detail="R script execution timed out after 30 seconds"
        )
    except Exception as e:
        logger.error(f"Unexpected error during demo analysis: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail=f"Unexpected error during demo analysis: {str(e)}"
        )

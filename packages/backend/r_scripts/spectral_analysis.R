#!/usr/bin/env Rscript
# spectral_analysis.R - Fourier transform and spectral decomposition
# Extract hidden frequencies from time series data

# Suppress warnings for clean JSON output
options(warn = -1)

# Wrap execution in tryCatch for robust error handling
tryCatch({
    suppressPackageStartupMessages({
        library(jsonlite)
    })

    # Null coalescing operator
    `%||%` <- function(a, b) if (is.null(a)) b else a

    # Main spectral decomposition function
    spectral_decompose <- function(x, sr = 1, n_peaks = 8) {
        # x: numeric vector (time series)
        # sr: sample rate (observations per second/hour/day)
        # n_peaks: how many dominant frequencies to extract

        n <- length(x)

        # Detrend (remove DC offset and linear trend)
        x_detrend <- residuals(lm(x ~ seq_along(x)))

        # Windowing (Hann window reduces spectral leakage)
        window <- 0.5 * (1 - cos(2 * pi * seq(0, n - 1) / (n - 1)))
        x_windowed <- x_detrend * window

        # FFT
        fft_result <- fft(x_windowed)

        # Power spectrum (single-sided)
        power <- Mod(fft_result[1:(n %/% 2 + 1)])^2 / n
        freqs <- (0:(n %/% 2)) * sr / n

        # Phase spectrum
        phase <- Arg(fft_result[1:(n %/% 2 + 1)])

        # Find peaks (local maxima in power spectrum)
        # Exclude DC (index 1) and Nyquist
        find_peaks <- function(x) {
            n <- length(x)
            if (n < 3) return(integer(0))
            peaks <- which(diff(sign(diff(x))) == -2) + 1
            peaks[peaks > 1 & peaks < n]
        }

        peak_indices <- find_peaks(power)

        # Sort by power, take top n_peaks
        if (length(peak_indices) > 0) {
            peak_order <- order(power[peak_indices], decreasing = TRUE)
            top_peaks <- peak_indices[peak_order][1:min(n_peaks, length(peak_indices))]
        } else {
            # If no peaks found, just take the highest power values (excluding DC)
            top_peaks <- order(power[-1], decreasing = TRUE)[1:min(n_peaks, length(power) - 1)] + 1
        }

        # Build output
        components <- lapply(top_peaks, function(i) {
            list(
                frequency = freqs[i],
                period = if (freqs[i] > 0) 1 / freqs[i] else Inf,
                power = power[i],
                power_normalized = power[i] / max(power[-1]),  # normalize excluding DC
                phase = phase[i],
                phase_degrees = phase[i] * 180 / pi
            )
        })

        # Spectral centroid (brightness measure)
        total_power <- sum(power[-1])
        centroid <- if (total_power > 0) sum(freqs[-1] * power[-1]) / total_power else 0

        # Spectral entropy (complexity measure)
        p <- power[-1] / total_power
        p <- p[p > 0]
        entropy <- if (length(p) > 0) -sum(p * log2(p)) / log2(length(p)) else 0

        # Spectral rolloff (where 85% of energy is below)
        cumulative <- cumsum(power[-1]) / total_power
        rolloff_idx <- which(cumulative >= 0.85)[1]
        rolloff <- if (!is.na(rolloff_idx)) freqs[rolloff_idx + 1] else freqs[length(freqs)]

        list(
            components = components,
            metadata = list(
                n_samples = n,
                sample_rate = sr,
                spectral_centroid = centroid,
                spectral_entropy = entropy,
                spectral_rolloff = rolloff,
                total_power = total_power
            ),
            full_spectrum = list(
                frequencies = freqs,
                power = power,
                phase = phase
            )
        )
    }

    # Cross-spectral analysis between two series
    cross_spectral <- function(x, y, sr = 1) {
        n <- min(length(x), length(y))
        x <- x[1:n]
        y <- y[1:n]

        # Detrend both series
        x_detrend <- residuals(lm(x ~ seq_along(x)))
        y_detrend <- residuals(lm(y ~ seq_along(y)))

        # Use R's built-in spectrum with smoothing
        spec_result <- tryCatch({
            spectrum(cbind(x_detrend, y_detrend), spans = c(3, 5), plot = FALSE)
        }, error = function(e) {
            # If spectrum fails, return NULL
            NULL
        })

        if (is.null(spec_result)) {
            return(list(
                error = TRUE,
                message = "Cross-spectral analysis failed"
            ))
        }

        # Extract coherence and phase
        coherence <- spec_result$coh
        phase_diff <- Arg(spec_result$phase)
        freqs <- spec_result$freq * sr

        # Summary: weighted average coherence
        total_spec <- spec_result$spec[,1] + spec_result$spec[,2]
        mean_coh <- weighted.mean(coherence, total_spec)

        list(
            frequencies = freqs,
            coherence = coherence,
            phase_difference = phase_diff,
            mean_coherence = mean_coh
        )
    }

    # Main entry point - read from stdin or command-line args
    main <- function() {
        # Try to read JSON from stdin
        stdin_input <- file("stdin", "r")
        stdin_lines <- tryCatch({
            paste(readLines(stdin_input, warn = FALSE), collapse = "\n")
        }, error = function(e) {
            NULL
        }, finally = {
            close(stdin_input)
        })

        if (!is.null(stdin_lines) && nchar(stdin_lines) > 0) {
            # Parse JSON input
            data <- fromJSON(stdin_lines)

            result <- list()

            # If single series
            if (!is.null(data$series)) {
                result$spectral <- spectral_decompose(
                    data$series,
                    sr = data$sample_rate %||% 1,
                    n_peaks = data$n_peaks %||% 8
                )
            }

            # If two series (for cross-spectral)
            if (!is.null(data$series1) && !is.null(data$series2)) {
                result$spectral1 <- spectral_decompose(
                    data$series1,
                    sr = data$sample_rate %||% 1,
                    n_peaks = data$n_peaks %||% 8
                )
                result$spectral2 <- spectral_decompose(
                    data$series2,
                    sr = data$sample_rate %||% 1,
                    n_peaks = data$n_peaks %||% 8
                )
                result$cross <- cross_spectral(
                    data$series1,
                    data$series2,
                    sr = data$sample_rate %||% 1
                )
            }

            # Output as JSON
            cat(toJSON(result, auto_unbox = TRUE, digits = 8))
        } else {
            # Demo mode: generate a test signal
            # Signal: mix of 0.1 Hz, 0.3 Hz, and noise
            t <- seq(0, 10, length.out = 100)
            signal <- sin(2 * pi * 0.1 * t) + 0.5 * sin(2 * pi * 0.3 * t) + rnorm(100, 0, 0.1)

            result <- spectral_decompose(signal, sr = 10, n_peaks = 5)

            output <- list(
                demo = TRUE,
                message = "Demo mode: analyzing synthetic signal (0.1 Hz + 0.3 Hz + noise)",
                spectral = result
            )

            cat(toJSON(output, auto_unbox = TRUE, digits = 8))
        }
    }

    # Run main
    main()

}, error = function(e) {
    # If anything fails, output error as JSON
    error_output <- list(
        error = TRUE,
        message = as.character(e$message),
        call = as.character(e$call)
    )
    cat(toJSON(error_output, auto_unbox = TRUE, pretty = FALSE))
    quit(status = 1)
})

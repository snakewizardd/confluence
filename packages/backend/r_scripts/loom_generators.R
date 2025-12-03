#!/usr/bin/env Rscript
# loom_generators.R - Generative Mathematical Sonification Engine
# Where mathematics becomes sound, where formulas dream in audio

library(jsonlite)

# 1. LORENZ ATTRACTOR (Chaos Theory)
# Three coupled differential equations, sensitive to initial conditions
lorenz <- function(n = 2000, dt = 0.01, sigma = 10, rho = 28, beta = 8/3) {
  x <- y <- z <- numeric(n)
  x[1] <- 0.1
  y[1] <- 0
  z[1] <- 0

  for (i in 2:n) {
    x[i] <- x[i-1] + dt * sigma * (y[i-1] - x[i-1])
    y[i] <- y[i-1] + dt * (x[i-1] * (rho - z[i-1]) - y[i-1])
    z[i] <- z[i-1] + dt * (x[i-1] * y[i-1] - beta * z[i-1])
  }

  # Calculate trajectory speed (for tempo mapping)
  speed <- numeric(n-1)
  for (i in 1:(n-1)) {
    dx <- x[i+1] - x[i]
    dy <- y[i+1] - y[i]
    dz <- z[i+1] - z[i]
    speed[i] <- sqrt(dx^2 + dy^2 + dz^2)
  }

  # Detect wing switches (sign change in x)
  wing_switches <- which(diff(sign(x)) != 0)

  # Normalize to 0-1 for sonification
  x_norm <- (x - min(x)) / (max(x) - min(x))
  y_norm <- (y - min(y)) / (max(y) - min(y))
  z_norm <- (z - min(z)) / (max(z) - min(z))

  list(
    x = x_norm,
    y = y_norm,
    z = z_norm,
    raw = list(x = x, y = y, z = z),
    speed = speed,
    wing_switches = wing_switches,
    params = list(sigma = sigma, rho = rho, beta = beta, dt = dt)
  )
}

# 2. CELLULAR AUTOMATON (Discrete Emergence)
# Rule 110 - proven Turing complete
automaton <- function(rule = 110, width = 64, generations = 64) {
  rule_bits <- as.integer(intToBits(rule)[1:8])

  grid <- matrix(0L, nrow = generations, ncol = width)
  grid[1, width %/% 2] <- 1L  # seed center

  for (g in 2:generations) {
    for (c in 2:(width - 1)) {
      pattern <- grid[g-1, c-1] * 4 + grid[g-1, c] * 2 + grid[g-1, c+1]
      grid[g, c] <- rule_bits[pattern + 1]
    }
    # Wrap edges
    grid[g, 1] <- rule_bits[(grid[g-1, width] * 4 + grid[g-1, 1] * 2 + grid[g-1, 2]) + 1]
    grid[g, width] <- rule_bits[(grid[g-1, width-1] * 4 + grid[g-1, width] * 2 + grid[g-1, 1]) + 1]
  }

  # Convert to rhythmic density per row (flamenco compás)
  density <- rowSums(grid) / width

  # Active cells as note triggers
  triggers <- which(grid == 1, arr.ind = TRUE)

  # Convert triggers to list of {row, col} objects
  triggers_list <- lapply(1:nrow(triggers), function(i) {
    list(row = triggers[i, 1] - 1, col = triggers[i, 2] - 1)  # 0-indexed for JS
  })

  list(
    grid = grid,
    density = density,
    triggers = triggers_list,
    rule = rule,
    width = width,
    generations = generations
  )
}

# 3. FIBONACCI SPIRAL (Golden Ratio Harmonics)
fibonacci_spiral <- function(n = 144) {
  phi <- (1 + sqrt(5)) / 2  # golden ratio

  # Fibonacci sequence
  fib <- numeric(n)
  fib[1] <- 1
  fib[2] <- 1
  for (i in 3:n) {
    fib[i] <- fib[i-1] + fib[i-2]
  }

  # Spiral coordinates (golden angle)
  theta <- (1:n) * 2 * pi / phi^2
  r <- sqrt(1:n)

  x <- r * cos(theta)
  y <- r * sin(theta)

  # Ratios approach phi (harmony)
  ratios <- fib[2:n] / fib[1:(n-1)]

  # Normalize coordinates
  x_norm <- (x - min(x)) / (max(x) - min(x))
  y_norm <- (y - min(y)) / (max(y) - min(y))

  list(
    x = x_norm,
    y = y_norm,
    raw = list(x = x, y = y, r = r, theta = theta),
    fib = fib,
    ratios = ratios,
    phi = phi
  )
}

# 4. STRANGE ATTRACTOR (Clifford)
# Four parameters create infinite variety
clifford <- function(n = 5000, a = -1.4, b = 1.6, c = 1.0, d = 0.7) {
  x <- y <- numeric(n)
  x[1] <- y[1] <- 0.1

  for (i in 2:n) {
    x[i] <- sin(a * y[i-1]) + c * cos(a * x[i-1])
    y[i] <- sin(b * x[i-1]) + d * cos(b * y[i-1])
  }

  # Calculate velocity between points (for dynamics)
  velocity <- numeric(n-1)
  for (i in 1:(n-1)) {
    dx <- x[i+1] - x[i]
    dy <- y[i+1] - y[i]
    velocity[i] <- sqrt(dx^2 + dy^2)
  }

  # Normalize coordinates
  x_norm <- (x - min(x)) / (max(x) - min(x))
  y_norm <- (y - min(y)) / (max(y) - min(y))

  list(
    x = x_norm,
    y = y_norm,
    raw = list(x = x, y = y),
    velocity = velocity,
    params = list(a = a, b = b, c = c, d = d)
  )
}

# Master generator function
generate_loom <- function(system, params = list()) {
  result <- tryCatch({
    switch(system,
      "lorenz" = do.call(lorenz, params),
      "automaton" = do.call(automaton, params),
      "fibonacci" = do.call(fibonacci_spiral, params),
      "clifford" = do.call(clifford, params),
      stop(paste("Unknown system:", system))
    )
  }, error = function(e) {
    return(list(error = TRUE, message = as.character(e)))
  })

  if (!is.null(result$error) && result$error) {
    return(result)
  }

  list(
    system = system,
    data = result,
    timestamp = format(Sys.time(), "%Y-%m-%dT%H:%M:%SZ")
  )
}

# Main execution
main <- function() {
  # Read from stdin
  stdin_input <- file("stdin", "r")
  input_lines <- readLines(stdin_input, warn = FALSE)
  close(stdin_input)

  # Check if we have input
  if (length(input_lines) == 0 || all(nchar(input_lines) == 0)) {
    # Demo mode - generate Lorenz attractor
    result <- generate_loom("lorenz", list())
  } else {
    # Parse JSON input
    input_data <- tryCatch({
      fromJSON(paste(input_lines, collapse = "\n"))
    }, error = function(e) {
      return(list(error = TRUE, message = paste("Invalid JSON:", as.character(e))))
    })

    if (!is.null(input_data$error) && input_data$error) {
      cat(toJSON(input_data, auto_unbox = TRUE))
      quit(status = 1)
    }

    # Extract system and parameters
    system <- input_data$system
    params <- if (!is.null(input_data$params)) input_data$params else list()

    # Generate the mathematical system
    result <- generate_loom(system, params)
  }

  # Check for errors
  if (!is.null(result$data$error) && result$data$error) {
    cat(toJSON(result$data, auto_unbox = TRUE))
    quit(status = 1)
  }

  # Output as JSON
  cat(toJSON(result, auto_unbox = TRUE, digits = 6))
}

# Run if called directly
if (!interactive()) {
  main()
}

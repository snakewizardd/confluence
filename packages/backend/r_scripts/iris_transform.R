#!/usr/bin/env Rscript
# iris_transform.R - Transform the iris dataset into sinusoidal waves
# Fisher's 1936 dataset becomes living sound

# Load required library
library(jsonlite)

# Load the sacred iris dataset - Fisher's 1936 contribution to statistics
data(iris)

# Normalize all numeric columns to [0,1] range
# This maps botanical measurements to the universal interval
normalize <- function(x) {
  (x - min(x)) / (max(x) - min(x))
}

iris_norm <- iris
iris_norm$Sepal.Length <- normalize(iris$Sepal.Length)
iris_norm$Sepal.Width <- normalize(iris$Sepal.Width)
iris_norm$Petal.Length <- normalize(iris$Petal.Length)
iris_norm$Petal.Width <- normalize(iris$Petal.Width)

# Create sinusoidal waves for each observation
# Each feature becomes a different frequency, phase offset creates harmony
waves <- lapply(1:nrow(iris_norm), function(i) {
  row <- iris_norm[i, ]

  # Time parameter for wave generation
  t <- (i - 1) / (nrow(iris_norm) - 1)

  # Extract normalized values
  sl <- row$Sepal.Length
  sw <- row$Sepal.Width
  pl <- row$Petal.Length
  pw <- row$Petal.Width

  # Generate individual wave components with different frequencies and phases
  # Frequency 1 (fundamental), phase pi/4
  wave1 <- sl * sin(2 * pi * 1 * t + pi/4)
  # Frequency 2 (first harmonic), phase pi/2
  wave2 <- sw * sin(2 * pi * 2 * t + pi/2)
  # Frequency 3 (second harmonic), phase 3pi/4
  wave3 <- pl * sin(2 * pi * 3 * t + 3*pi/4)
  # Frequency 4 (third harmonic), phase pi
  wave4 <- pw * sin(2 * pi * 4 * t + pi)

  # Composite wave - the unity of all features
  composite <- (wave1 + wave2 + wave3 + wave4) / 4

  list(
    index = i - 1,  # 0-indexed for JavaScript
    t = t,
    sepal_length = sl,
    sepal_width = sw,
    petal_length = pl,
    petal_width = pw,
    species = as.character(row$Species),
    composite_wave = composite,
    wave1 = wave1,
    wave2 = wave2,
    wave3 = wave3,
    wave4 = wave4
  )
})

# Calculate species statistics - understanding the patterns
species_stats <- lapply(unique(iris$Species), function(sp) {
  subset_data <- iris[iris$Species == sp, ]
  list(
    species = as.character(sp),
    count = nrow(subset_data),
    mean_sepal_length = mean(subset_data$Sepal.Length),
    mean_sepal_width = mean(subset_data$Sepal.Width),
    mean_petal_length = mean(subset_data$Petal.Length),
    mean_petal_width = mean(subset_data$Petal.Width)
  )
})

# Metadata - the context of this transformation
metadata <- list(
  dataset = "iris",
  source = "Fisher, R.A. (1936) The use of multiple measurements in taxonomic problems",
  observations = nrow(iris),
  features = 4,
  species = length(unique(iris$Species)),
  year = 1936,
  transformation = "sinusoidal_waves",
  frequencies = c(1, 2, 3, 4),
  phase_offsets = c(pi/4, pi/2, 3*pi/4, pi)
)

# Assemble the complete output
output <- list(
  waves = waves,
  species_stats = species_stats,
  metadata = metadata
)

# Output as JSON to stdout - the language of the web
cat(toJSON(output, auto_unbox = TRUE, pretty = FALSE))

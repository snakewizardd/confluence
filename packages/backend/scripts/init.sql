-- CONFLUENCE DATABASE INITIALIZATION
-- The schema of memory

-- Enable extensions we'll need
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm"; -- For text search

-- Time series data table
CREATE TABLE IF NOT EXISTS time_series (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    unit VARCHAR(50),
    source VARCHAR(50) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Time series data points
CREATE TABLE IF NOT EXISTS time_series_data (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    series_id UUID NOT NULL REFERENCES time_series(id) ON DELETE CASCADE,
    timestamp TIMESTAMP WITH TIME ZONE NOT NULL,
    value DOUBLE PRECISION NOT NULL,
    metadata JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index for efficient time-based queries
CREATE INDEX IF NOT EXISTS idx_time_series_data_timestamp
    ON time_series_data(series_id, timestamp DESC);

-- Harmony scores - the measure of balance
CREATE TABLE IF NOT EXISTS harmony_scores (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    overall DOUBLE PRECISION NOT NULL CHECK (overall >= 0 AND overall <= 1),
    data_flow_balance DOUBLE PRECISION NOT NULL CHECK (data_flow_balance >= 0 AND data_flow_balance <= 1),
    system_health DOUBLE PRECISION NOT NULL CHECK (system_health >= 0 AND system_health <= 1),
    convergence DOUBLE PRECISION NOT NULL CHECK (convergence >= 0 AND convergence <= 1),
    entropy DOUBLE PRECISION NOT NULL CHECK (entropy >= 0 AND entropy <= 1),
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Reflections and meditations - the contemplations
CREATE TABLE IF NOT EXISTS reflections (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    content TEXT NOT NULL,
    context JSONB,
    harmony_score_id UUID REFERENCES harmony_scores(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Poems - the artistic expressions
CREATE TABLE IF NOT EXISTS poems (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title VARCHAR(255),
    content TEXT NOT NULL,
    inspiration JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create a function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger for time_series table
CREATE TRIGGER update_time_series_updated_at
    BEFORE UPDATE ON time_series
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Insert a welcome meditation
INSERT INTO reflections (content, context) VALUES (
    'The system awakens. Data begins to flow like rivers finding their course. This is the first breath of Confluence - where disciplines dissolve and unity emerges.',
    jsonb_build_object('event', 'initialization', 'timestamp', NOW()::text)
);

CREATE TABLE IF NOT EXISTS proxy (
    id SERIAL PRIMARY KEY,
    proxy VARCHAR(255),
    UNIQUE(proxy)
)
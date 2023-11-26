CREATE TABLE IF NOT EXISTS login (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) NOT NULL,
    password VARCHAR(255) NOT NULL,
    apiKey VARCHAR(255),
    apiSecret VARCHAR(255),
    UNIQUE (email)
);
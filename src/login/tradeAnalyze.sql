CREATE TABLE IF NOT EXISTS news_headline (
    id SERIAL PRIMARY KEY,
    _id VARCHAR(255) UNIQUE,
    title TEXT,
    newsHeadline TEXT,
    url TEXT,
    link TEXT,
    time TEXT,
    suggestions VARCHAR[],
    body TEXT
);

CREATE TABLE IF NOT EXISTS chatgpt_sentiment (
    id SERIAL PRIMARY KEY,
    news_id VARCHAR(255) ,
    time_stamp VARCHAR(255),
    ticker VARCHAR(255),
    sentiment NUMERIC,
    CONSTRAINT fk_news_headline FOREIGN KEY (news_id)
    REFERENCES news_headline (_id)
);

CREATE TABLE IF NOT EXISTS trade_data (
    id SERIAL PRIMARY KEY,
    news_id VARCHAR(255),
    time_stamp VARCHAR(255),
    ticker VARCHAR(255),
    side VARCHAR(5),
    entry TEXT,
    partial VARCHAR(5),
    pnl TEXT,
    outcome VARCHAR(255),
    CONSTRAINT fk_news_headline_trade FOREIGN KEY (news_id)
    REFERENCES news_headline (_id)
);
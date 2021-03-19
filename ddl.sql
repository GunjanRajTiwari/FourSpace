CREATE TABLE users(
    id SERIAL,
    name VARCHAR(63) NOT NULL,
    email VARCHAR(63) NOT NULL UNIQUE PRIMARY KEY,
    available BOOLEAN DEFAULT true,
    password VARCHAR(72) NOT NULL
);

CREATE TABLE companies(
    id SERIAL PRIMARY KEY,
    name VARCHAR(63) NOT NULL,
    email VARCHAR(63) NOT NULL UNIQUE,
    openings SMALLINT CHECK(openings >= 0) DEFAULT 0,
    password VARCHAR(72) NOT NULL
);
CREATE TABLE users(
    name VARCHAR(63) NOT NULL,
    email VARCHAR(63) NOT NULL UNIQUE PRIMARY KEY,
    available BOOLEAN DEFAULT true,
    rating INT DEFAULT 0,
    password VARCHAR(72) NOT NULL
);

CREATE TABLE companies(
    name VARCHAR(63) NOT NULL,
    email VARCHAR(63) NOT NULL UNIQUE PRIMARY KEY,
    openings SMALLINT CHECK(openings >= 0) DEFAULT 0,
    password VARCHAR(72) NOT NULL
);

CREATE TABLE contests(
    id SERIAL PRIMARY KEY,
    name VARCHAR(63) NOT NULL UNIQUE,
    info TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    company_email VARCHAR(63),
    CONSTRAINT company FOREIGN KEY(company_email) REFERENCES companies(email)
);

CREATE TABLE questions(
    id SERIAL PRIMARY KEY,
    title VARCHAR(63) NOT NULL UNIQUE,
    statement TEXT,
    contest_id INT,
    difficulty VARCHAR(8),
    points INT NOT NULL DEFAULT 100,
    testcase VARCHAR(63),
    output VARCHAR(63),
    CONSTRAINT contest FOREIGN KEY(contest_id) REFERENCES contests(id)
);

CREATE TABLE participation(
    score INT DEFAULT 0,
    contest_id INT,
    user_email VARCHAR(63),
    CONSTRAINT contest FOREIGN KEY(contest_id) REFERENCES contests(id),
    CONSTRAINT coder FOREIGN KEY(user_email) REFERENCES users(email)
);
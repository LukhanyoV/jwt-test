CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(20) NOT NULL,
    password VARCHAR(20) NOT NULL
);

CREATE TABLE todolist (
    id SERIAL PRIMARY KEY,
    item TEXT,
    author INT NOT NULL,
    FOREIGN KEY (author) REFERENCES users(id)
);
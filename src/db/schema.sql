DROP DATABASE mojigram;
CREATE DATABASE mojigram;

\c mojigram;

CREATE TABLE account (
    id              char(36) PRIMARY KEY,
    username        varchar(15),
    password        varchar(128),
    created_at      timestamptz,
    born_at         timestamptz,
    UNIQUE(username)
);

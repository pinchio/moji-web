DROP DATABASE mojigram;
CREATE DATABASE mojigram;

\c mojigram;

CREATE TABLE account (
    id              char(36) PRIMARY KEY,
    created_at      timestamptz,
    updated_at      timestamptz,
    username        varchar(15),
    email           varchar(128),
    full_name       varchar(128),
    password        varchar(512),
    born_at         timestamptz,
    UNIQUE(username),
    UNIQUE(email)
);

CREATE TABLE moji (
    id              char(36) PRIMARY KEY,
    created_at      timestamptz,
    updated_at      timestamptz,
    display_name    varchar(128),
    slug_name       varchar(128),
    tags            varchar(128)[],
    privacy         varchar(128)[],
    created_by      char(36),
    UNIQUE(slug_name)
);

CREATE TABLE moji_stat (
    id              char(36) PRIMARY KEY,
    last_sent_at    timestamptz,
    sent_count      integer,
    download_count  integer
);

CREATE TABLE moji_collection (
    id              char(36) PRIMARY KEY,
    created_at      timestamptz,
    updated_at      timestamptz,
    display_name    varchar(128),
    slug_name       varchar(128),
    tags            varchar(128)[],
    privacy         varchar(128)[],
    created_by      char(36),
    UNIQUE(slug_name)
);

CREATE TABLE moji__moji_collection (
    id              char(36) PRIMARY KEY,
    moji_id         char(36),
    moji_collection_id char(36),
    created_at      timestamptz,
    UNIQUE(moji_id, moji_collection_id)
)

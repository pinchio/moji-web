DROP DATABASE mojigram;
CREATE DATABASE mojigram;

\c mojigram;

DROP TABLE account;
DROP TABLE emoji;
DROP TABLE emoji_stat;
DROP TABLE emoji_collection;

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

CREATE TABLE emoji (
    id              char(36) PRIMARY KEY,
    created_at      timestamptz,
    updated_at      timestamptz,
    deleted_at      timestamptz,
    slug_name       varchar(128),
    display_name    varchar(128),
    tags            varchar(128)[],
    scopes          varchar(128)[],
    created_by      char(36),
    image_url       varchar(512),
    emoji_collection_id char(36)
);

CREATE TABLE emoji_stat (
    id              char(36) PRIMARY KEY,
    last_sent_at    timestamptz,
    sent_count      integer,
    download_count  integer
);

CREATE TABLE emoji_collection (
    id              char(36) PRIMARY KEY,
    created_at      timestamptz,
    updated_at      timestamptz,
    deleted_at      timestamptz,
    slug_name       varchar(128),
    display_name    varchar(128),
    tags            varchar(128)[],
    scopes          varchar(128)[],
    created_by      char(36)
);

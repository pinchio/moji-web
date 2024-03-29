\c mojigram;

DROP TABLE account;
CREATE TABLE account (
    id              char(36) PRIMARY KEY,
    created_at      timestamptz,
    updated_at      timestamptz,
    username        varchar(15),
    email           varchar(128),
    full_name       varchar(128),
    password        varchar(512),
    profile_image_url varchar(512),
    born_at         timestamptz,
    fb_id           varchar(512),
    fb_access_token varchar(1024),
    roles           integer,
    extra_data      text,
    UNIQUE(username),
    UNIQUE(email),
    UNIQUE(fb_id)
);
INSERT INTO account (id, created_at, updated_at, username, email, full_name, password, profile_image_url, born_at, roles, extra_data) values ('d23cadef-bacc-43d1-a5b9-4f53185fb710', now(), now(), 'mojigram', 'mojigram@gmail.com', 'mojigram', '57sVeyJf7UVDAPwKtvdGpqXPmFewcdv4sJkcDYybkqyQbf8RaNVO2te22DfwvmZFowrX52m2kf89bFi2q18nA53SdCqTA1+8fze9c/+6uGD8RFvzUE11qBnC5rvG14p1B3m5q22+dkU0ZvrKOKHVGgcM4pyXjyDaRV61ktQV7xieFH+NNN1yRjPtxYMPBW3nycfnE8sqOnzrlmynOMyLXxLmOgX0hZvSylGJsszy6givOi+NoRQVWHJRf5FKZBQKGHmOljs0o+qlqyIpyfF7pxRNJbwwQTc2pw2co5/zfHeVajbAEwXIcyBRJvfJjUcY3mSzZLdDKiZPGo9OjwvLiQ==:2710.M474tosHIV4yjQDRANdnjsDczzrBvliC5kAr0CZEcI8=', null, null, 1, '{}');

DROP TABLE asset;
CREATE TABLE asset (
    id              char(36) PRIMARY KEY,
    created_at      timestamptz,
    updated_at      timestamptz,
    deleted_at      timestamptz,
    created_by      char(36),
    asset_url       varchar(512),
    UNIQUE(asset_url)
);

DROP TABLE emoji;
CREATE TABLE emoji (
    id              char(36) PRIMARY KEY,
    created_at      timestamptz,
    updated_at      timestamptz,
    deleted_at      timestamptz,
    slug_name       varchar(128),
    display_name    varchar(128),
    tags            text[],
    scopes          text[],
    created_by      char(36),
    asset_url       varchar(512),
    asset_hash      varchar(512),
    sent_count      integer NOT NULL DEFAULT 0,
    saved_count     integer NOT NULL DEFAULT 0,
    emoji_collection_id char(36),
    ancestor_emoji_id char(36),
    parent_emoji_id char(36),
    extra_data      text
);

DROP TABLE event;
CREATE TABLE event (
    id              char(36) PRIMARY KEY,
    created_at      timestamptz,
    event           varchar(512),
    label           varchar(512),
    value           varchar(512),
    event_group_id  char(36),
    created_by      char(36)
);

DROP TABLE emoji_collection;
CREATE TABLE emoji_collection (
    id              char(36) PRIMARY KEY,
    created_at      timestamptz,
    updated_at      timestamptz,
    deleted_at      timestamptz,
    slug_name       varchar(128),
    display_name    varchar(128),
    tags            text[],
    scopes          text[],
    created_by      char(36),
    extra_data      text
);

DROP TABLE emoji_collection_follower;
CREATE TABLE emoji_collection_follower (
    id              char(36) PRIMARY KEY,
    created_at      timestamptz,
    emoji_collection_id char(36),
    follower        char(36),
    UNIQUE(emoji_collection_id, follower)
);

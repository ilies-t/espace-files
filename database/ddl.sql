-- Extension "uuid-ossp"
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Function "random_key"
DROP FUNCTION IF EXISTS random_key;
CREATE OR REPLACE FUNCTION random_key(length INTEGER)
    RETURNS TEXT AS $$
SELECT array_to_string(array(
                               SELECT substr('0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz',
                                             floor(random()*62)::int + 1, 1)
                               FROM generate_series(1,length)), '');
$$ LANGUAGE SQL;

-- Table "account"
DROP TABLE IF EXISTS account CASCADE;
CREATE TABLE IF NOT EXISTS account(
                                      id UUID NOT NULL DEFAULT UUID_GENERATE_V4() PRIMARY KEY,
                                      created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
                                      full_name TEXT NOT NULL,
                                      email TEXT NOT NULL UNIQUE,
                                      reset_password_token TEXT UNIQUE,
                                      password_hash TEXT NOT NULL,
                                      api_auth BYTEA,
                                      api_key BYTEA
);

-- Table "file"
DROP TABLE IF EXISTS file CASCADE;
CREATE TABLE IF NOT EXISTS file(
                                   id UUID NOT NULL DEFAULT UUID_GENERATE_V4() PRIMARY KEY,
                                   created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
                                   name TEXT NOT NULL,
                                   parent UUID,
                                   CONSTRAINT fk_parent FOREIGN KEY(parent) REFERENCES file(id) ON UPDATE CASCADE ON DELETE CASCADE,
                                   account UUID NOT NULL,
                                   CONSTRAINT fk_account FOREIGN KEY(account) REFERENCES account(id) ON UPDATE CASCADE ON DELETE CASCADE,
                                   byte_size INTEGER NOT NULL,
                                   mime TEXT NOT NULL,
                                   is_folder BOOLEAN NOT NULL DEFAULT FALSE,
                                   is_public BOOLEAN NOT NULL DEFAULT FALSE,
                                   eth_transaction_id TEXT,
                                   ipfs_id TEXT,
                                   encryption_salt_hex BYTEA NOT NULL,
                                   encryption_auth_tag_hex BYTEA NOT NULL,
                                   encryption_key_hex BYTEA NOT NULL
);
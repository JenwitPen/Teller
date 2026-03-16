-- +goose Up
ALTER TABLE accounts ADD 
    branch_code VARCHAR(10),
    account_type VARCHAR(20),
    currency_code VARCHAR(3),
    account_name VARCHAR(100),
    status VARCHAR(20) DEFAULT 'ACTIVE',
    version INT DEFAULT 1,
    closed_at DATETIME2 NULL;

-- +goose Down
ALTER TABLE accounts DROP COLUMN branch_code;
ALTER TABLE accounts DROP COLUMN account_type;
ALTER TABLE accounts DROP COLUMN currency_code;
ALTER TABLE accounts DROP COLUMN account_name;
ALTER TABLE accounts DROP COLUMN status;
ALTER TABLE accounts DROP COLUMN version;
ALTER TABLE accounts DROP COLUMN closed_at;

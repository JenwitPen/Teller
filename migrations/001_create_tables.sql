-- +goose Up
CREATE TABLE accounts (
  account_id VARCHAR(64) NOT NULL PRIMARY KEY,
  balance DECIMAL(18,2) NOT NULL,
  created_at DATETIME2 NOT NULL,
  updated_at DATETIME2 NOT NULL
);

CREATE TABLE transaction_history (
  id BIGINT IDENTITY(1,1) NOT NULL PRIMARY KEY,
  account_id VARCHAR(64) NOT NULL,
  amount DECIMAL(18,2) NOT NULL,
  balance_after DECIMAL(18,2) NOT NULL,
  transaction_type VARCHAR(16) NOT NULL,
  description VARCHAR(255) NULL,
  created_at DATETIME2 NOT NULL
);

-- +goose Down
DROP TABLE transaction_history;
DROP TABLE accounts;

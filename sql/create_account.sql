CREATE TABLE accounts (
  account_id VARCHAR(64) NOT NULL PRIMARY KEY,
  balance DECIMAL(18,2) NOT NULL,
  created_at DATETIME2 NOT NULL,
  updated_at DATETIME2 NOT NULL
);

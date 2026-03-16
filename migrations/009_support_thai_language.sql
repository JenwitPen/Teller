-- +goose Up
-- Support Thai language by converting VARCHAR to NVARCHAR for descriptive columns

-- Accounts table
ALTER TABLE accounts ALTER COLUMN account_name NVARCHAR(100);

-- Transaction History table
ALTER TABLE transaction_history ALTER COLUMN description NVARCHAR(255);

-- +goose Down
-- Revert changes from NVARCHAR to VARCHAR

-- Accounts table
ALTER TABLE accounts ALTER COLUMN account_name VARCHAR(100);

-- Transaction History table
ALTER TABLE transaction_history ALTER COLUMN description VARCHAR(255);

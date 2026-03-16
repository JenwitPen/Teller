-- +goose Up
-- Create single-column indexes for performance optimization

-- 1. Table: accounts
CREATE INDEX idx_accounts_branch_code ON accounts (branch_code);
CREATE INDEX idx_accounts_account_type ON accounts (account_type);
CREATE INDEX idx_accounts_status ON accounts (status);

-- 2. Table: users
CREATE INDEX idx_users_employee_id ON users (employee_id);
CREATE INDEX idx_users_branch_code ON users (branch_code);
CREATE INDEX idx_users_status ON users (status);

-- 3. Table: transaction_history
CREATE INDEX idx_th_account_id ON transaction_history (account_id);
CREATE INDEX idx_th_branch_code ON transaction_history (branch_code);
CREATE INDEX idx_th_employee_id ON transaction_history (employee_id);
CREATE INDEX idx_th_created_at ON transaction_history (created_at);

-- +goose Down
-- Remove single-column indexes
DROP INDEX idx_th_created_at ON transaction_history;
DROP INDEX idx_th_employee_id ON transaction_history;
DROP INDEX idx_th_branch_code ON transaction_history;
DROP INDEX idx_th_account_id ON transaction_history;
DROP INDEX idx_users_status ON users;
DROP INDEX idx_users_branch_code ON users;
DROP INDEX idx_users_employee_id ON users;
DROP INDEX idx_accounts_status ON accounts;
DROP INDEX idx_accounts_account_type ON accounts;
DROP INDEX idx_accounts_branch_code ON accounts;

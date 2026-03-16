-- +goose Up
INSERT INTO accounts (account_id, balance, created_at, updated_at, branch_code, account_type, currency_code, account_name, status, version) VALUES
('ACC-INITIAL-01', 5000.00, SYSUTCDATETIME(), SYSUTCDATETIME(), 'BKK-001', 'SAVINGS', 'THB', 'John Doe Account', 'ACTIVE', 1),
('ACC-INITIAL-02', 12000.50, SYSUTCDATETIME(), SYSUTCDATETIME(), 'BKK-001', 'CURRENT', 'THB', 'Jane Smith Account', 'ACTIVE', 1),
('ACC-INITIAL-03', 300.00, SYSUTCDATETIME(), SYSUTCDATETIME(), 'CNX-002', 'SAVINGS', 'THB', 'Michael Brown Account', 'ACTIVE', 1),
('ACC-INITIAL-04', 45000.00, SYSUTCDATETIME(), SYSUTCDATETIME(), 'HKT-003', 'FIXED_DEPOSIT', 'THB', 'Alice Cooper Account', 'ACTIVE', 1),
('ACC-INITIAL-05', 0.00, SYSUTCDATETIME(), SYSUTCDATETIME(), 'BKK-001', 'SAVINGS', 'THB', 'Robert Taylor Account', 'CLOSED', 1);

UPDATE accounts SET closed_at = SYSUTCDATETIME() WHERE account_id = 'ACC-INITIAL-05';

-- +goose Down
DELETE FROM accounts WHERE account_id IN ('ACC-INITIAL-01', 'ACC-INITIAL-02', 'ACC-INITIAL-03', 'ACC-INITIAL-04', 'ACC-INITIAL-05');

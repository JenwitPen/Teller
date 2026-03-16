-- +goose Up
ALTER TABLE users 
ADD branch_code VARCHAR(10) NULL,
    updated_at DATETIME2 NULL DEFAULT SYSUTCDATETIME(),
    status VARCHAR(10) NULL DEFAULT 'ACTIVE' CHECK(status IN ('ACTIVE', 'INACTIVE')),
    employee_id VARCHAR(50) NULL UNIQUE;

-- +goose Down
ALTER TABLE users 
DROP COLUMN employee_id, status, updated_at, branch_code;

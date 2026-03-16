-- +goose Up
ALTER TABLE transaction_history 
ADD branch_code VARCHAR(10) NULL,
    employee_id VARCHAR(50) NULL;

-- +goose Down
ALTER TABLE transaction_history 
DROP COLUMN employee_id, branch_code;

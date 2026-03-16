-- +goose Up
ALTER TABLE users
ADD role VARCHAR(20) NOT NULL DEFAULT 'TELLER'
    CONSTRAINT chk_users_role CHECK (role IN ('ADMIN', 'TELLER'));

UPDATE users SET role = 'ADMIN' WHERE username = 'admin';

-- +goose Down
ALTER TABLE users DROP CONSTRAINT chk_users_role;
ALTER TABLE users DROP COLUMN role;

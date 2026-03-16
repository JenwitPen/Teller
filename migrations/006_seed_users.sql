-- +goose Up
INSERT INTO users (username, password, branch_code, updated_at, status, employee_id) VALUES
('teller1', '$2b$10$43hFNoNL.tf84h.OUv1YyO4mschs1ceYPtV3YyBQsBZvnFWV5mpMi', '001', SYSUTCDATETIME(), 'ACTIVE', 'EMP001'),
('teller2', '$2b$10$43hFNoNL.tf84h.OUv1YyO4mschs1ceYPtV3YyBQsBZvnFWV5mpMi', '001', SYSUTCDATETIME(), 'ACTIVE', 'EMP002'),
('teller3', '$2b$10$43hFNoNL.tf84h.OUv1YyO4mschs1ceYPtV3YyBQsBZvnFWV5mpMi', '002', SYSUTCDATETIME(), 'ACTIVE', 'EMP003'),
('teller4', '$2b$10$43hFNoNL.tf84h.OUv1YyO4mschs1ceYPtV3YyBQsBZvnFWV5mpMi', '003', SYSUTCDATETIME(), 'INACTIVE', 'EMP004'),
('teller5', '$2b$10$43hFNoNL.tf84h.OUv1YyO4mschs1ceYPtV3YyBQsBZvnFWV5mpMi', '003', SYSUTCDATETIME(), 'ACTIVE', 'EMP005');

-- +goose Down
DELETE FROM users WHERE username IN ('teller1', 'teller2', 'teller3', 'teller4', 'teller5');

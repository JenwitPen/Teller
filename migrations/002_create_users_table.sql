-- +goose Up
CREATE TABLE users (
  id INT IDENTITY(1,1) NOT NULL PRIMARY KEY,
  username VARCHAR(64) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL,
  created_at DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME()
);

INSERT INTO users (username, password)
VALUES ('admin', '$2b$10$43hFNoNL.tf84h.OUv1YyO4mschs1ceYPtV3YyBQsBZvnFWV5mpMi');

-- +goose Down
DROP TABLE users;

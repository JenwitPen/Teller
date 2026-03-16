-- +goose Up
-- Partition transaction_history table by created_at column (Monthly for 2026)

-- 1. Create Partition Function
-- +goose StatementBegin
IF NOT EXISTS (SELECT * FROM sys.partition_functions WHERE name = 'pf_transaction_date')
BEGIN
    CREATE PARTITION FUNCTION pf_transaction_date (DATETIME2)
    AS RANGE RIGHT FOR VALUES (
        '2026-02-01', '2026-03-01', '2026-04-01', '2026-05-01', '2026-06-01', 
        '2026-07-01', '2026-08-01', '2026-09-01', '2026-10-01', '2026-11-01', '2026-12-01'
    );
END
-- +goose StatementEnd

-- 2. Create Partition Scheme
-- +goose StatementBegin
IF NOT EXISTS (SELECT * FROM sys.partition_schemes WHERE name = 'ps_transaction_date')
BEGIN
    CREATE PARTITION SCHEME ps_transaction_date
    AS PARTITION pf_transaction_date ALL TO ([PRIMARY]);
END
-- +goose StatementEnd

-- 3. Drop existing Primary Key Constraint
-- +goose StatementBegin
DECLARE @PKName NVARCHAR(255);
SELECT @PKName = name FROM sys.key_constraints 
WHERE parent_object_id = OBJECT_ID('transaction_history') AND type = 'PK';

IF @PKName IS NOT NULL 
    EXEC('ALTER TABLE transaction_history DROP CONSTRAINT ' + @PKName);
-- +goose StatementEnd

-- 4. Create Clustered Index on Partition Scheme using created_at
-- +goose StatementBegin
IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'ix_transaction_history_created_at' AND object_id = OBJECT_ID('transaction_history'))
BEGIN
    CREATE CLUSTERED INDEX ix_transaction_history_created_at 
    ON transaction_history (created_at)
    ON ps_transaction_date (created_at);
END
-- +goose StatementEnd

-- 5. Re-add Primary Key as NONCLUSTERED on PRIMARY filegroup
-- +goose StatementBegin
IF NOT EXISTS (SELECT * FROM sys.key_constraints WHERE name = 'PK_TransactionHistory_ID' AND parent_object_id = OBJECT_ID('transaction_history'))
BEGIN
    ALTER TABLE transaction_history 
    ADD CONSTRAINT PK_TransactionHistory_ID PRIMARY KEY NONCLUSTERED (id) ON [PRIMARY];
END
-- +goose StatementEnd

-- +goose Down
-- Revert partitioning
-- +goose StatementBegin
-- 1. Revert structure
IF EXISTS (SELECT * FROM sys.key_constraints WHERE name = 'PK_TransactionHistory_ID')
    ALTER TABLE transaction_history DROP CONSTRAINT PK_TransactionHistory_ID;

IF EXISTS (SELECT * FROM sys.indexes WHERE name = 'ix_transaction_history_created_at')
    DROP INDEX ix_transaction_history_created_at ON transaction_history;

-- 2. Re-add original Clustered PK
IF NOT EXISTS (SELECT * FROM sys.key_constraints WHERE parent_object_id = OBJECT_ID('transaction_history') AND type = 'PK')
BEGIN
    ALTER TABLE transaction_history 
    ADD CONSTRAINT pk_transaction_history PRIMARY KEY CLUSTERED (id);
END

-- 3. Drop Partition Objects
IF EXISTS (SELECT * FROM sys.partition_schemes WHERE name = 'ps_transaction_date')
    DROP PARTITION SCHEME ps_transaction_date;
    
IF EXISTS (SELECT * FROM sys.partition_functions WHERE name = 'pf_transaction_date')
    DROP PARTITION FUNCTION pf_transaction_date;
-- +goose StatementEnd

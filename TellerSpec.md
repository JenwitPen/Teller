# Teller System Technical Specification

The Teller system is a specialized banking service backend designed for handling account management, transaction processing, and user authentication with high security and concurrency control.

## 1. System Architecture

The application is built using **NestJS** (Node.js framework) following a modular architecture:

- **Core Framework**: NestJS + TypeScript
- **Database**: Microsoft SQL Server (MSSQL)
- **High Availability**: SQL Server Always On Availability Groups
- **ORM**: TypeORM (Primary for writes/updates), Raw SQL (Primary for optimized selects)
- **Caching & Concurrency**: Redis (Session management, Token Blacklisting, Distributed Locking)
- **Authentication**: JWT (JSON Web Token) with Single-Session enforcement
- **API Documentation**: Swagger (OpenAPI 3.0)

## 2. Project Structure

The project follows a standard NestJS directory structure with a focus on modularity:

```text
Teller/
├── migrations/          # Database migration files (Goose)
├── scripts/             # Utility scripts (e.g., curls.sh for API testing)
├── sql/                 # Raw SQL files and schemas
├── src/                 # Application source code
│   ├── account/         # Account management module
│   ├── auth/            # Authentication & JWT module
│   ├── common/          # Global modules (Config, Redis, Pipes)
│   ├── health/          # Health check endpoints
│   ├── transaction-history/ # Transaction logging module
│   ├── user/            # User & Role management module
│   ├── app.module.ts    # Root application module
│   └── main.ts          # Application entry point
├── .env                 # Environment configuration
├── docker-compose-*.yml # Docker service definitions (DB, Redis)
├── package.json         # Dependency and script definitions
└── TellerSpec.md        # Technical specification document
```

## 3. Infrastructure & Configuration

### 3.1 High Availability (SQL Server Always On)
The system is configured to support SQL Server Always On Failover natively:
- **MultiSubnetFailover**: Enabled (`true`) for faster reconnection during failover.
- **ApplicationIntent**: Configured as `ReadWrite` for the primary node.
- **Connection Strings**: Managed via individual environment variables rather than hardcoded strings.

### 3.2 Environment Variables (.env)
Critical configuration is managed via `.env`, including:
- `DB_SERVER`, `DB_PORT`, `DB_DATABASE`, `DB_USER`, `DB_PASSWORD`
- `DB_ENCRYPT`, `DB_MULTI_SUBNET_FAILOVER`, `DB_APPLICATION_INTENT`
- `REDIS_HOST`, `REDIS_PORT`, `REDIS_PASSWORD`
- `JWT_EXPIRATION`, `CACHE_TTL_SECONDS`

## 4. Database Schema

The system uses **Goose** for versioned migrations. All string columns use `NVARCHAR` for Thai language support.

### 4.1 Table: `users`
| Column | Type | Description |
| :--- | :--- | :--- |
| `id` | INT (PK) | Auto-incrementing identifier |
| `username` | NVARCHAR(64) | Unique username (Indexed) |
| `password` | NVARCHAR(255) | BCrypt hashed password |
| `branch_code`| NVARCHAR(10) | Assigned branch code (Indexed) |
| `status` | NVARCHAR(16) | `ACTIVE` or `INACTIVE` (Indexed) |
| `employee_id`| NVARCHAR(64) | Unique employee identifier (Indexed) |
| `role` | NVARCHAR(20) | `ADMIN` or `TELLER` |
| `created_at` | DATETIME2 | Record creation timestamp |
| `updated_at` | DATETIME2 | Last update timestamp |

### 4.2 Table: `accounts`
| Column | Type | Description |
| :--- | :--- | :--- |
| `account_id` | NVARCHAR(64) (PK)| Unique account identifier |
| `balance` | DECIMAL(18,2)| Current account balance |
| `branch_code`| NVARCHAR(10) | Branch where account was opened (Indexed) |
| `account_type`| NVARCHAR(20) | e.g., `SAVINGS`, `CURRENT` (Indexed) |
| `currency_code`| NVARCHAR(3) | e.g., `THB` |
| `account_name`| NVARCHAR(100) | Full name of the account holder |
| `status` | NVARCHAR(16) | `ACTIVE`, `INACTIVE`, etc. (Indexed) |
| `version` | INT | For optimistic locking |
| `closed_at` | DATETIME2 | Nullable timestamp |
| `created_at` | DATETIME2 | Record creation timestamp |
| `updated_at` | DATETIME2 | Last update timestamp |

### 4.3 Table: `transaction_history`
| Column | Type | Description |
| :--- | :--- | :--- |
| `id` | INT (PK) | Auto-incrementing identifier |
| `account_id` | NVARCHAR(64) | Refers to `accounts.account_id` (Indexed) |
| `amount` | DECIMAL(18,2)| Transaction amount |
| `balance_after`| DECIMAL(18,2)| Balance after transaction processed |
| `transaction_type`| NVARCHAR(16) | `DEPOSIT` or `WITHDRAW` |
| `description`| NVARCHAR(255) | Thai support enabled |
| `branch_code`| NVARCHAR(10) | Branch where transaction occurred (Indexed) |
| `employee_id`| NVARCHAR(64) | Staff who processed the transaction (Indexed) |
| `created_at` | DATETIME2 | Transaction timestamp (Clustered Index / Partition Key) |

> [!NOTE]
> `transaction_history` is partitioned by month (Range Right) using the `created_at` column to ensure performance on large datasets.

## 5. Security & Concurrency

### 5.1 Authentication Flow
- **Single Session Control**: 
    1. Upon login, the old session token (if any) is retrieved from Redis.
    2. The old token is immediately **Blacklisted** in Redis for its remaining TTL.
    3. A new JWT is generated and stored in Redis as the active session.
- **JWT Guards**: All administrative and financial APIs are protected by `@UseGuards(JwtAuthGuard)`.
- **RBAC**: User roles (`ADMIN`, `TELLER`) control access to specific endpoints.

### 5.2 Transaction Integrity
- **Distributed Locking (Redis)**: Used in `UpdateBalanceV2` to prevent race conditions during concurrent balance updates.
- **Pessimistic Locking (SQL Server)**: Implemented in core balance services (`WITH (UPDLOCK, ROWLOCK)`) to ensure data consistency.

## 6. API Specification

### 6.1 Authentication
- `POST /auth/login`: Authenticates user and returns JWT + User Details.
- `POST /auth/logout`: Invalidates the current JWT and clears the active session.

### 6.2 Account Management
- `POST /accounts`: Create a new account (TypeORM).
- `GET /accounts/search`: Search accounts with filters (account_id, branch, type) using raw SQL for performance.
- `POST /accounts/edit`: Update account metadata (TypeORM).
- **Balance Updates**:
    - `POST /accounts/balance`: Standard update with transaction logging.
    - `POST /accounts/balance/v2`: Enhanced update using Redis-based locking.

### 6.3 Transaction History
- `GET /transaction-history`: Retrieve logs with advanced filtering (Date range, staff ID, branch, page).

## 7. Health & Monitoring
- **Technology**: NestJS Terminus.
- **Liveness probe**: `/health/liveness` - Checks if the application instance is running.
- **Readiness probe**: `/health/readiness` - Performs a `pingCheck` using `TypeOrmHealthIndicator` and Redis status.

## 8. Development Standards
- **Validation**: Strict request validation using `class-validator` and `ValidationPipe`.
- **Port**: Default application port is `8000`.
- **Docs**: Interactive API documentation available at `http://localhost:8000/api/docs`.
- **CORS**: Cross-Origin Resource Sharing is enabled for `http://localhost:3000` with support for `GET` and `POST` methods and credentials true.
- **Migrations**: Database changes must be performed via `goose` migrations.

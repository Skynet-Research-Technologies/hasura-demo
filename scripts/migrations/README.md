# Database Migration Guide for Multi-Tenancy

This document describes how to manage database migrations for multi-tenancy in the Hasura demo project.

## Migration Structure

The migration system consists of:

1. **Versioned migration files** in the `scripts/migrations/` directory, following the naming pattern:
   - `V{YYYYMMDD}_{NNN}__{description}.sql` for "up" migrations
   - `V{YYYYMMDD}_{NNN}__{description}_rollback.sql` for "down" migrations

2. **A migration runner script** (`scripts/run_migrations.sh`) to apply or rollback migrations

3. **A schema_migrations table** in the database to track applied migrations

## Migration Files

Each migration consists of:

- **Up migration**: Makes schema changes (add tables, columns, indexes, etc.)
- **Down migration**: Reverts those changes (drop columns, indexes, etc.)

All migrations are written as idempotent scripts that can be run multiple times without errors.

## Running Migrations

To apply all pending migrations:

```bash
./scripts/run_migrations.sh apply
```

To apply a specific migration:

```bash
./scripts/run_migrations.sh apply V20250527_001
```

To rollback a specific migration:

```bash
./scripts/run_migrations.sh rollback V20250527_001
```

## Multi-Tenancy Implementation

The multi-tenancy system consists of:

1. **tenant_id column** in all tables
2. **Optimized indexes** with tenant_id as the first column
3. **Row-level security policies** managed by Hasura v3

### Database Best Practices for Multi-Tenancy

1. **Always filter queries by tenant_id**
   - All queries should include tenant_id in WHERE clauses
   - Use Hasura permissions to enforce tenant isolation

2. **Use composite indexes**
   - Leading with tenant_id improves performance
   - Additional columns based on query patterns

3. **Maintain tenant data isolation**
   - Let Hasura v3 manage RLS policies
   - Use foreign key constraints within tenant boundaries

## Initial Setup vs. Migration

If setting up a new system:
- Use the updated `db-init.sql` from `scripts/migrations/update_db_init.sql`

If migrating an existing system:
- Use the migration script `V20250527_001__add_multi_tenancy.sql`

## Testing Migrations

Always test migrations in a non-production environment before applying to production:

```bash
# On development or staging
export DB_HOST=dev-db-host
./scripts/run_migrations.sh apply

# Review changes, then apply to production
export DB_HOST=prod-db-host
./scripts/run_migrations.sh apply
```

-- COMPREHENSIVE SUPABASE DATABASE DUMP
-- Run each section in Supabase SQL Editor and save the results

-- =============================================================================
-- 1. DUMP ALL TABLES (structure and constraints)
-- =============================================================================
SELECT
    'CREATE TABLE ' || schemaname || '.' || tablename || ' (' ||
    string_agg(
        column_name || ' ' || data_type ||
        CASE
            WHEN character_maximum_length IS NOT NULL THEN '(' || character_maximum_length || ')'
            WHEN numeric_precision IS NOT NULL AND numeric_scale IS NOT NULL THEN '(' || numeric_precision || ',' || numeric_scale || ')'
            WHEN numeric_precision IS NOT NULL THEN '(' || numeric_precision || ')'
            ELSE ''
        END ||
        CASE WHEN is_nullable = 'NO' THEN ' NOT NULL' ELSE '' END ||
        CASE WHEN column_default IS NOT NULL THEN ' DEFAULT ' || column_default ELSE '' END,
        ', '
    ) || ');' as create_table_statement
FROM information_schema.tables t
JOIN information_schema.columns c ON t.table_name = c.table_name AND t.table_schema = c.table_schema
WHERE t.table_schema = 'public'
    AND t.table_type = 'BASE TABLE'
    AND t.table_name NOT LIKE '_realtime_%'
GROUP BY schemaname, tablename, t.table_name
ORDER BY t.table_name;

-- =============================================================================
-- 2. DUMP ALL PRIMARY KEYS
-- =============================================================================
SELECT
    'ALTER TABLE ' || tc.table_schema || '.' || tc.table_name ||
    ' ADD CONSTRAINT ' || tc.constraint_name || ' PRIMARY KEY (' ||
    string_agg(kcu.column_name, ', ' ORDER BY kcu.ordinal_position) || ');' as primary_key_statement
FROM information_schema.table_constraints tc
JOIN information_schema.key_column_usage kcu ON tc.constraint_name = kcu.constraint_name
    AND tc.table_schema = kcu.table_schema
WHERE tc.constraint_type = 'PRIMARY KEY'
    AND tc.table_schema = 'public'
GROUP BY tc.table_schema, tc.table_name, tc.constraint_name
ORDER BY tc.table_name;

-- =============================================================================
-- 3. DUMP ALL FOREIGN KEYS
-- =============================================================================
SELECT
    'ALTER TABLE ' || tc.table_schema || '.' || tc.table_name ||
    ' ADD CONSTRAINT ' || tc.constraint_name || ' FOREIGN KEY (' ||
    kcu.column_name || ') REFERENCES ' || ccu.table_schema || '.' || ccu.table_name ||
    '(' || ccu.column_name || ')' ||
    CASE WHEN rc.update_rule != 'NO ACTION' THEN ' ON UPDATE ' || rc.update_rule ELSE '' END ||
    CASE WHEN rc.delete_rule != 'NO ACTION' THEN ' ON DELETE ' || rc.delete_rule ELSE '' END ||
    ';' as foreign_key_statement
FROM information_schema.table_constraints tc
JOIN information_schema.key_column_usage kcu ON tc.constraint_name = kcu.constraint_name
    AND tc.table_schema = kcu.table_schema
JOIN information_schema.constraint_column_usage ccu ON ccu.constraint_name = tc.constraint_name
    AND ccu.table_schema = tc.table_schema
JOIN information_schema.referential_constraints rc ON tc.constraint_name = rc.constraint_name
    AND tc.table_schema = rc.constraint_schema
WHERE tc.constraint_type = 'FOREIGN KEY'
    AND tc.table_schema = 'public'
ORDER BY tc.table_name, tc.constraint_name;

-- =============================================================================
-- 4. DUMP ALL INDEXES
-- =============================================================================
SELECT
    indexname,
    'CREATE ' ||
    CASE WHEN indisunique THEN 'UNIQUE ' ELSE '' END ||
    'INDEX ' ||
    CASE WHEN NOT indexname ~ '^[a-zA-Z_][a-zA-Z0-9_]*$' THEN '"' || indexname || '"' ELSE indexname END ||
    ' ON ' || schemaname || '.' || tablename ||
    CASE
        WHEN indexdef ~ 'USING' THEN ' ' || substring(indexdef from 'USING[^(]+')
        ELSE ''
    END ||
    ' (' || substring(indexdef from '\(([^)]+)\)') || ')' ||
    CASE
        WHEN indexdef ~ 'WHERE' THEN ' ' || substring(indexdef from 'WHERE.*$')
        ELSE ''
    END ||
    ';' as index_statement
FROM pg_indexes
JOIN pg_class c ON c.relname = indexname
JOIN pg_index i ON i.indexrelid = c.oid
WHERE schemaname = 'public'
    AND indexname NOT LIKE '%_pkey'  -- Exclude primary key indexes
    AND NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints tc
        WHERE tc.constraint_type = 'UNIQUE'
            AND tc.table_schema = schemaname
            AND tc.constraint_name = indexname
    )
ORDER BY tablename, indexname;

-- =============================================================================
-- 5. DUMP ALL FUNCTIONS
-- =============================================================================
SELECT
    'CREATE OR REPLACE FUNCTION ' || n.nspname || '.' || p.proname || '(' ||
    COALESCE(
        pg_get_function_arguments(p.oid),
        ''
    ) || ') RETURNS ' ||
    pg_get_function_result(p.oid) || ' AS $' || '$' ||
    E'\n' || p.prosrc || E'\n' ||
    '$' || '$ LANGUAGE ' || l.lanname ||
    CASE WHEN p.provolatile = 'i' THEN ' IMMUTABLE'
         WHEN p.provolatile = 's' THEN ' STABLE'
         ELSE ' VOLATILE' END ||
    CASE WHEN p.prosecdef THEN ' SECURITY DEFINER' ELSE '' END ||
    ';' as function_statement
FROM pg_proc p
JOIN pg_namespace n ON p.pronamespace = n.oid
JOIN pg_language l ON p.prolang = l.oid
WHERE n.nspname = 'public'
    AND p.prokind = 'f'  -- Only functions, not procedures
ORDER BY p.proname;

-- =============================================================================
-- 6. DUMP ALL TRIGGERS
-- =============================================================================
SELECT
    'CREATE ' ||
    CASE WHEN t.tgtype & 1 = 1 THEN 'TRIGGER ' ELSE 'TRIGGER ' END ||
    t.tgname || ' ' ||
    CASE
        WHEN t.tgtype & 2 = 2 THEN 'BEFORE'
        WHEN t.tgtype & 4 = 4 THEN 'AFTER'
        ELSE 'INSTEAD OF'
    END || ' ' ||
    CASE
        WHEN t.tgtype & 4 = 4 THEN 'INSERT'
        WHEN t.tgtype & 8 = 8 THEN 'DELETE'
        WHEN t.tgtype & 16 = 16 THEN 'UPDATE'
        ELSE 'UNKNOWN'
    END ||
    ' ON ' || n.nspname || '.' || c.relname ||
    ' FOR EACH ROW EXECUTE FUNCTION ' ||
    pn.nspname || '.' || p.proname || '();' as trigger_statement
FROM pg_trigger t
JOIN pg_class c ON t.tgrelid = c.oid
JOIN pg_namespace n ON c.relnamespace = n.oid
JOIN pg_proc p ON t.tgfoid = p.oid
JOIN pg_namespace pn ON p.pronamespace = pn.oid
WHERE n.nspname = 'public'
    AND NOT t.tgisinternal
ORDER BY c.relname, t.tgname;

-- =============================================================================
-- 7. DUMP ALL RLS POLICIES
-- =============================================================================
SELECT
    'CREATE POLICY ' || pol.polname || ' ON ' || n.nspname || '.' || c.relname ||
    ' FOR ' ||
    CASE pol.polcmd
        WHEN 'r' THEN 'SELECT'
        WHEN 'a' THEN 'INSERT'
        WHEN 'w' THEN 'UPDATE'
        WHEN 'd' THEN 'DELETE'
        WHEN '*' THEN 'ALL'
        ELSE 'UNKNOWN'
    END ||
    CASE
        WHEN pol.polroles != '{0}' THEN
            ' TO ' || array_to_string(
                ARRAY(
                    SELECT rolname
                    FROM pg_roles
                    WHERE oid = ANY(pol.polroles)
                ), ', '
            )
        ELSE ''
    END ||
    CASE
        WHEN pol.polqual IS NOT NULL THEN
            ' USING (' || pg_get_expr(pol.polqual, pol.polrelid) || ')'
        ELSE ''
    END ||
    CASE
        WHEN pol.polwithcheck IS NOT NULL THEN
            ' WITH CHECK (' || pg_get_expr(pol.polwithcheck, pol.polrelid) || ')'
        ELSE ''
    END ||
    ';' as policy_statement
FROM pg_policy pol
JOIN pg_class c ON pol.polrelid = c.oid
JOIN pg_namespace n ON c.relnamespace = n.oid
WHERE n.nspname = 'public'
ORDER BY c.relname, pol.polname;

-- =============================================================================
-- 8. DUMP RLS STATUS FOR ALL TABLES
-- =============================================================================
SELECT
    'ALTER TABLE ' || n.nspname || '.' || c.relname ||
    CASE WHEN c.relrowsecurity THEN ' ENABLE ROW LEVEL SECURITY;'
         ELSE ' DISABLE ROW LEVEL SECURITY;'
    END as rls_statement
FROM pg_class c
JOIN pg_namespace n ON c.relnamespace = n.oid
WHERE n.nspname = 'public'
    AND c.relkind = 'r'  -- Only tables
ORDER BY c.relname;

-- =============================================================================
-- 9. DUMP ALL VIEWS
-- =============================================================================
SELECT
    'CREATE VIEW ' || schemaname || '.' || viewname || ' AS ' ||
    E'\n' || definition as view_statement
FROM pg_views
WHERE schemaname = 'public'
ORDER BY viewname;

-- =============================================================================
-- 10. DUMP ALL SEQUENCES
-- =============================================================================
SELECT
    'CREATE SEQUENCE ' || sequence_schema || '.' || sequence_name ||
    ' START WITH ' || start_value ||
    ' INCREMENT BY ' || increment ||
    ' MINVALUE ' || minimum_value ||
    ' MAXVALUE ' || maximum_value ||
    CASE WHEN cycle_option = 'YES' THEN ' CYCLE' ELSE ' NO CYCLE' END ||
    ';' as sequence_statement
FROM information_schema.sequences
WHERE sequence_schema = 'public'
ORDER BY sequence_name;

-- =============================================================================
-- 11. DUMP TABLE OWNERSHIP AND GRANTS (if needed)
-- =============================================================================
SELECT
    'GRANT ' || privilege_type || ' ON ' || table_schema || '.' || table_name ||
    ' TO ' || grantee ||
    CASE WHEN is_grantable = 'YES' THEN ' WITH GRANT OPTION' ELSE '' END ||
    ';' as grant_statement
FROM information_schema.table_privileges
WHERE table_schema = 'public'
    AND grantee != 'postgres'  -- Exclude default postgres grants
ORDER BY table_name, grantee, privilege_type;

-- =============================================================================
-- 12. DUMP FUNCTION GRANTS
-- =============================================================================
SELECT
    'GRANT EXECUTE ON FUNCTION ' || n.nspname || '.' || p.proname || '(' ||
    COALESCE(pg_get_function_arguments(p.oid), '') || ') TO ' ||
    r.rolname || ';' as function_grant_statement
FROM pg_proc p
JOIN pg_namespace n ON p.pronamespace = n.oid
JOIN pg_proc_acl a ON p.oid = a.objoid
JOIN pg_roles r ON a.grantee = r.oid
WHERE n.nspname = 'public'
    AND r.rolname != 'postgres'
ORDER BY p.proname, r.rolname;
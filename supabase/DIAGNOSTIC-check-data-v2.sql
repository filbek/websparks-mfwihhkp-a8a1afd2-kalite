-- DIAGNOSTIC SCRIPT (SELECT VERSION)
-- Bu scripti çalıştırın ve RESULTS sekmesine bakın.

SELECT 
    'Users' as table_name, 
    COUNT(*) as total_count, 
    COUNT(*) FILTER (WHERE organization_id = 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa') as in_default_org,
    COUNT(*) FILTER (WHERE organization_id IS NULL) as null_org
FROM users

UNION ALL

SELECT 
    'Boards' as table_name, 
    COUNT(*) as total_count, 
    COUNT(*) FILTER (WHERE organization_id = 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa') as in_default_org,
    COUNT(*) FILTER (WHERE organization_id IS NULL) as null_org
FROM boards

UNION ALL

SELECT 
    'Cards' as table_name, 
    COUNT(*) as total_count, 
    COUNT(*) FILTER (WHERE organization_id = 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa') as in_default_org,
    COUNT(*) FILTER (WHERE organization_id IS NULL) as null_org
FROM cards;

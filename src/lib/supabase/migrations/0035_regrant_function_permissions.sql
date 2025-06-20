-- Regrant execute permissions on the function
grant execute on function get_race_details(bigint) to authenticated, anon;

-- Test the function again
select 'Function test' as check_type, * from get_race_details(5); 
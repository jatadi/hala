-- Check the lists table structure
select 
  table_name,
  column_name,
  data_type,
  udt_name
from information_schema.columns 
where table_schema = 'public' 
and table_name = 'lists';

-- Check if the table exists
select exists (
  select 1 
  from information_schema.tables 
  where table_schema = 'public' 
  and table_name = 'lists'
) as table_exists; 
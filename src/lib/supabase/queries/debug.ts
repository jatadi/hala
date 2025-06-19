import { supabase } from '../client';

export async function debugUserProfile(username: string) {
  // 1. Get user ID
  const { data: user, error: userError } = await supabase
    .from('users')
    .select('id, username')
    .eq('username', username)
    .single();
  
  console.log('User:', user);
  if (userError) console.error('User error:', userError);

  if (!user) return null;

  // 2. Get Bahrain GP match
  const { data: match, error: matchError } = await supabase
    .from('matches')
    .select('id, title, ext_id, starts_at')
    .eq('ext_id', '2024-bahrain-gp')
    .single();

  console.log('Bahrain GP:', match);
  if (matchError) console.error('Match error:', matchError);

  // 3. Get user's logs
  const { data: logs, error: logsError } = await supabase
    .from('logs')
    .select(`
      *,
      match:matches (
        title,
        starts_at
      )
    `)
    .eq('user_id', user.id);

  console.log('Logs:', logs);
  if (logsError) console.error('Logs error:', logsError);

  // 4. If no log exists for Bahrain GP, create it
  if (match && (!logs || !logs.some(log => log.match_id === match.id))) {
    const { data: newLog, error: createError } = await supabase
      .from('logs')
      .insert({
        user_id: user.id,
        match_id: match.id,
        rating: 4.5,
        review: 'Incredible race! Max dominated from start to finish.',
        watched_at: match.starts_at
      })
      .select()
      .single();

    if (createError) {
      console.error('Error creating log:', createError);
    } else {
      console.log('Created new log:', newLog);
    }
  }

  // 5. Get user profile stats
  const { data: profile, error: profileError } = await supabase
    .from('user_profiles')
    .select('*')
    .eq('username', username)
    .single();

  console.log('Profile:', profile);
  if (profileError) console.error('Profile error:', profileError);

  // 6. Direct SQL query to verify
  const { data: sqlCheck, error: sqlError } = await supabase
    .rpc('debug_profile', { username_param: username });

  console.log('SQL Check:', sqlCheck);
  if (sqlError) console.error('SQL error:', sqlError);

  return {
    user,
    match,
    logs,
    profile,
    sqlCheck
  };
} 
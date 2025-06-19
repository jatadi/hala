/* First delete existing test user if exists */
delete from public.users where username = 'maxv';

/* Insert test user with placeholder avatar */
insert into public.users (username, bio, avatar_url)
values (
  'maxv',
  'Three-time F1 World Champion',
  'https://ui-avatars.com/api/?name=Max+Verstappen&background=0D8ABC&color=fff'
); 
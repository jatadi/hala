import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function middleware(request: NextRequest) {
  const res = NextResponse.next();
  const supabase = createMiddlewareClient({ req: request, res });
  const { data: { session } } = await supabase.auth.getSession();

  if (!session) {
    const redirectUrl = new URL('/sign-in', request.url);
    redirectUrl.searchParams.set('redirect', request.nextUrl.pathname);
    return NextResponse.redirect(redirectUrl);
  }

  // Check if user owns the list
  const listId = request.nextUrl.pathname.split('/')[2];
  const { data: list } = await supabase
    .from('lists')
    .select('owner_id')
    .eq('id', listId)
    .single();

  if (!list || list.owner_id !== session.user.id) {
    return NextResponse.redirect(new URL('/lists', request.url));
  }

  return res;
}

export const config = {
  matcher: '/lists/:id/edit'
}; 
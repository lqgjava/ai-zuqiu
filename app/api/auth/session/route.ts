import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabaseClient';

export const dynamic = 'force-dynamic';

export async function GET() {
  if (!supabase) {
    return NextResponse.json(
      { error: 'Supabase is not configured.', session: null },
      { status: 200 }
    );
  }

  try {
    const { data, error } = await supabase.auth.getSession();

    if (error) {
      return NextResponse.json({ error: error.message, session: null }, { status: 200 });
    }

    return NextResponse.json({ session: data.session });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    return NextResponse.json({ error: message, session: null }, { status: 200 });
  }
}

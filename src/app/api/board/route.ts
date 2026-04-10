import { NextRequest } from 'next/server';
import { supabase } from '@/lib/supabase';

function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

// GET: 게시글 목록
export async function GET(request: NextRequest) {
  try {
    const category = request.nextUrl.searchParams.get('category') || undefined;
    const search = request.nextUrl.searchParams.get('search') || undefined;

    let query = supabase
      .from('board_posts')
      .select('id, title, category, author_email, author_name, created_at, view_count')
      .order('created_at', { ascending: false });

    if (category && category !== '전체') {
      query = query.eq('category', category);
    }
    if (search) {
      query = query.or(`title.ilike.%${search}%,content.ilike.%${search}%`);
    }

    const { data, error } = await query;
    if (error) throw error;
    return Response.json({ posts: data ?? [] });
  } catch {
    return Response.json({ error: '게시글 목록을 불러오는 데 실패했습니다.' }, { status: 500 });
  }
}

// POST: 게시글 작성
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { title, content, category, email, name } = body;

    if (!title?.trim() || !content?.trim() || !email?.trim()) {
      return Response.json({ error: '제목, 내용, 이메일은 필수입니다.' }, { status: 400 });
    }

    const id = generateId();
    const { data, error } = await supabase
      .from('board_posts')
      .insert({
        id,
        title: title.trim(),
        content: content.trim(),
        category: category || '일반',
        author_email: email.trim(),
        author_name: (name || '').trim(),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        view_count: 0,
      })
      .select()
      .single();

    if (error) throw error;
    return Response.json({ post: data }, { status: 201 });
  } catch {
    return Response.json({ error: '게시글 작성에 실패했습니다.' }, { status: 500 });
  }
}

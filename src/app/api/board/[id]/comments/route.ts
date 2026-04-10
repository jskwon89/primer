import { NextRequest } from 'next/server';
import { supabase } from '@/lib/supabase';

function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

// POST: 댓글 작성
export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id: postId } = await params;
    const body = await request.json();
    const { content, email, name } = body;

    if (!content?.trim() || !email?.trim()) {
      return Response.json({ error: '내용과 이메일은 필수입니다.' }, { status: 400 });
    }

    const id = generateId();
    const { data, error } = await supabase
      .from('board_comments')
      .insert({
        id,
        post_id: postId,
        content: content.trim(),
        author_email: email.trim(),
        author_name: (name || '').trim(),
        created_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) throw error;
    return Response.json({ comment: data }, { status: 201 });
  } catch {
    return Response.json({ error: '댓글 작성에 실패했습니다.' }, { status: 500 });
  }
}

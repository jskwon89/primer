import { NextRequest } from 'next/server';
import { supabase } from '@/lib/supabase';

// GET: 게시글 상세 + 조회수 증가
export async function GET(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;

    // 조회수 증가
    const { data: current } = await supabase.from('board_posts').select('view_count').eq('id', id).single();
    if (current) {
      await supabase.from('board_posts').update({ view_count: (current.view_count || 0) + 1 }).eq('id', id);
    }

    const { data, error } = await supabase
      .from('board_posts')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') return Response.json({ error: '게시글을 찾을 수 없습니다.' }, { status: 404 });
      throw error;
    }

    // 댓글도 함께
    const { data: comments } = await supabase
      .from('board_comments')
      .select('*')
      .eq('post_id', id)
      .order('created_at', { ascending: true });

    return Response.json({ post: data, comments: comments ?? [] });
  } catch {
    return Response.json({ error: '게시글을 불러오는 데 실패했습니다.' }, { status: 500 });
  }
}

// DELETE: 게시글 삭제 (본인 또는 관리자)
export async function DELETE(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const { error } = await supabase.from('board_posts').delete().eq('id', id);
    if (error) throw error;
    return Response.json({ success: true });
  } catch {
    return Response.json({ error: '삭제에 실패했습니다.' }, { status: 500 });
  }
}

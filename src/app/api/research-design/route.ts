import { NextRequest } from 'next/server';
import { getResearchRequests, createResearchRequest } from '@/lib/db';
import { notifyRequestReceived } from '@/lib/email';
import { notifyNewRequest } from '@/lib/discord';

export async function GET(request: NextRequest) {
  try {
    const email = request.nextUrl.searchParams.get('email') || undefined;
    const requests = await getResearchRequests(email);
    return Response.json({ requests });
  } catch (error) {
    return Response.json(
      { error: '의뢰 목록을 불러오는 데 실패했습니다.' },
      { status: 500 },
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { keywords, description, field, email } = body;
    if (!keywords || typeof keywords !== 'string' || keywords.trim() === '') {
      return Response.json(
        { error: '연구 키워드를 입력해주세요.' },
        { status: 400 },
      );
    }
    if (!field || typeof field !== 'string') {
      return Response.json(
        { error: '연구 분야를 선택해주세요.' },
        { status: 400 },
      );
    }
    const created = await createResearchRequest({
      keywords: keywords.trim(),
      description: (description || '').trim(),
      field: field.trim(),
      email: (email || '').trim(),
    });
    if (created.email) {
      await notifyRequestReceived(created.email, created.keywords);
    }
    await notifyNewRequest('research-design', created.email || '', created.keywords);
    return Response.json({ request: created }, { status: 201 });
  } catch (error) {
    return Response.json(
      { error: '의뢰 생성에 실패했습니다.' },
      { status: 500 },
    );
  }
}

import { NextRequest } from 'next/server';
import { getContactInquiries, createContactInquiry, updateContactInquiry } from '@/lib/db';
import { notifyContactInquiry } from '@/lib/discord';

export async function GET() {
  try {
    const inquiries = await getContactInquiries();
    return Response.json({ inquiries });
  } catch {
    return Response.json(
      { error: '문의 목록을 불러오는 데 실패했습니다.' },
      { status: 500 },
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, name, category, subject, message } = body;

    if (!email || typeof email !== 'string' || email.trim() === '') {
      return Response.json(
        { error: '이메일을 입력해주세요.' },
        { status: 400 },
      );
    }

    if (!subject || typeof subject !== 'string' || subject.trim() === '') {
      return Response.json(
        { error: '제목을 입력해주세요.' },
        { status: 400 },
      );
    }

    const created = await createContactInquiry({
      email: (email || '').trim(),
      name: (name || '').trim(),
      category: (category || '일반 문의').trim(),
      subject: (subject || '').trim(),
      message: (message || '').trim(),
    });

    await notifyContactInquiry(created.email || '', created.subject || '');
    return Response.json({ inquiry: created }, { status: 201 });
  } catch {
    return Response.json(
      { error: '문의 등록에 실패했습니다.' },
      { status: 500 },
    );
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, ...patch } = body;

    if (!id) {
      return Response.json({ error: 'ID가 필요합니다.' }, { status: 400 });
    }

    const updated = await updateContactInquiry(id, patch);
    if (!updated) {
      return Response.json({ error: '문의를 찾을 수 없습니다.' }, { status: 404 });
    }

    return Response.json({ inquiry: updated });
  } catch {
    return Response.json(
      { error: '문의 수정에 실패했습니다.' },
      { status: 500 },
    );
  }
}

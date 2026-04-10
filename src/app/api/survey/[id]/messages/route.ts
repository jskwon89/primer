import { NextRequest } from 'next/server';
import { getSurveyMessages, addSurveyMessage } from '@/lib/db';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const messages = await getSurveyMessages(id);
    messages.sort(
      (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
    );
    return Response.json({ messages });
  } catch {
    return Response.json(
      { error: '메시지를 불러오는 데 실패했습니다.' },
      { status: 500 },
    );
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { sender, message } = body;

    if (!sender || !['user', 'admin'].includes(sender)) {
      return Response.json(
        { error: '유효하지 않은 발신자입니다.' },
        { status: 400 },
      );
    }
    if (!message || typeof message !== 'string' || message.trim() === '') {
      return Response.json(
        { error: '메시지를 입력해주세요.' },
        { status: 400 },
      );
    }

    const msg = await addSurveyMessage(id, sender, message.trim());
    return Response.json({ message: msg }, { status: 201 });
  } catch {
    return Response.json(
      { error: '메시지 전송에 실패했습니다.' },
      { status: 500 },
    );
  }
}

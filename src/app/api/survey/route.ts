import { NextRequest } from 'next/server';
import { getSurveyRequests, createSurveyRequest } from '@/lib/db';
import { notifyNewRequest } from '@/lib/discord';

export async function GET(request: NextRequest) {
  try {
    const email = request.nextUrl.searchParams.get('email') || undefined;
    const requests = await getSurveyRequests(email);
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
    const { email, title, purpose, requesterName, organization, population, sampleSize, samplingMethod, startDate, endDate, irbStatus, additionalRequests, surveyData } = body;

    if (!title || typeof title !== 'string' || title.trim() === '') {
      return Response.json(
        { error: '설문 제목을 입력해주세요.' },
        { status: 400 },
      );
    }
    if (!email || typeof email !== 'string' || email.trim() === '') {
      return Response.json(
        { error: '이메일을 입력해주세요.' },
        { status: 400 },
      );
    }

    const created = await createSurveyRequest({
      email: (email || '').trim(),
      title: (title || '').trim(),
      purpose: (purpose || '').trim(),
      requesterName: (requesterName || '').trim(),
      organization: (organization || '').trim(),
      population: (population || '').trim(),
      sampleSize: (sampleSize || '').trim(),
      samplingMethod: (samplingMethod || '').trim(),
      startDate: (startDate || '').trim(),
      endDate: (endDate || '').trim(),
      irbStatus: (irbStatus || '').trim(),
      additionalRequests: (additionalRequests || '').trim(),
      surveyData: (surveyData || '').trim(),
    });

    await notifyNewRequest('survey', created.email || '', created.title);
    return Response.json({ request: created }, { status: 201 });
  } catch (error) {
    return Response.json(
      { error: '의뢰 생성에 실패했습니다.' },
      { status: 500 },
    );
  }
}

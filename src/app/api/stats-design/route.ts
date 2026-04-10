import { NextRequest } from 'next/server';
import { getStatsDesignRequests, createStatsDesignRequest } from '@/lib/db';
import { notifyRequestReceived } from '@/lib/email';
import { notifyNewRequest } from '@/lib/discord';

export async function GET(request: NextRequest) {
  try {
    const email = request.nextUrl.searchParams.get('email') || undefined;
    const requests = await getStatsDesignRequests(email);
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
    const { email, researchType, dataType, sampleInfo, variables, analysisGoal, currentMethods, description } = body;

    if (!researchType || typeof researchType !== 'string') {
      return Response.json(
        { error: '연구 유형을 선택해주세요.' },
        { status: 400 },
      );
    }
    if (!dataType || typeof dataType !== 'string') {
      return Response.json(
        { error: '데이터 유형을 선택해주세요.' },
        { status: 400 },
      );
    }
    if (!analysisGoal || typeof analysisGoal !== 'string' || analysisGoal.trim() === '') {
      return Response.json(
        { error: '분석 목표를 입력해주세요.' },
        { status: 400 },
      );
    }

    const created = await createStatsDesignRequest({
      email: (email || '').trim(),
      researchType: researchType.trim(),
      dataType: dataType.trim(),
      sampleInfo: (sampleInfo || '').trim(),
      variables: (variables || '').trim(),
      analysisGoal: analysisGoal.trim(),
      currentMethods: (currentMethods || '').trim(),
      description: (description || '').trim(),
    });

    if (created.email) {
      await notifyRequestReceived(created.email, `통계분석 설계: ${created.researchType}`);
    }
    await notifyNewRequest('stats-design', created.email || '', created.analysisGoal);
    return Response.json({ request: created }, { status: 201 });
  } catch (error) {
    return Response.json(
      { error: '의뢰 생성에 실패했습니다.' },
      { status: 500 },
    );
  }
}

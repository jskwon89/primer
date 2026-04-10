const WEBHOOK_URL = process.env.DISCORD_WEBHOOK_URL;

const serviceLabels: Record<string, string> = {
  'research-design': '연구 설계',
  'stats-design': '통계분석 설계',
  'survey': '설문조사',
  'judgment-collection': '판결문 수집',
  'judgment-coding': '판결문 코딩',
  'news-collection': '뉴스 수집',
  'data-transform': '데이터 전처리',
  'quant-analysis': '계량분석',
  'text-analysis': '텍스트 분석',
  'qual-analysis': '질적분석',
};

export async function notifyNewRequest(serviceType: string, email: string, details?: string) {
  if (!WEBHOOK_URL) return;

  const label = serviceLabels[serviceType] || serviceType;
  const now = new Date().toLocaleString('ko-KR', { timeZone: 'Asia/Seoul' });

  const embed = {
    title: `새 의뢰 접수: ${label}`,
    color: 0xc49a2e,
    fields: [
      { name: '서비스', value: label, inline: true },
      { name: '이메일', value: email, inline: true },
      { name: '접수 시간', value: now, inline: false },
      ...(details ? [{ name: '내용', value: details.slice(0, 200), inline: false }] : []),
    ],
    footer: { text: 'ResearchOn 알림' },
  };

  try {
    await fetch(WEBHOOK_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        username: 'ResearchOn',
        embeds: [embed],
      }),
    });
  } catch {
    // 알림 실패해도 의뢰 접수는 정상 진행
  }
}

export async function notifyContactInquiry(email: string, subject: string) {
  if (!WEBHOOK_URL) return;

  const now = new Date().toLocaleString('ko-KR', { timeZone: 'Asia/Seoul' });

  try {
    await fetch(WEBHOOK_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        username: 'ResearchOn',
        embeds: [{
          title: '새 문의 접수',
          color: 0x5865f2,
          fields: [
            { name: '이메일', value: email, inline: true },
            { name: '제목', value: subject.slice(0, 100), inline: true },
            { name: '접수 시간', value: now, inline: false },
          ],
          footer: { text: 'ResearchOn 알림' },
        }],
      }),
    });
  } catch {
    // ignore
  }
}

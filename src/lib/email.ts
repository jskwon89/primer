interface EmailParams {
  to: string;
  subject: string;
  body: string;
}

export async function sendEmail({ to, subject, body }: EmailParams): Promise<boolean> {
  // TODO: Connect real email provider (Resend, SendGrid, etc.)
  console.log(`[EMAIL] To: ${to} | Subject: ${subject} | Body: ${body}`);
  return true;
}

export function notifyRequestReceived(email: string, keywords: string) {
  return sendEmail({
    to: email,
    subject: '[ResearchOn] 연구 설계 의뢰가 접수되었습니다',
    body: `안녕하세요.\n\n'${keywords}' 관련 연구 설계 의뢰가 정상적으로 접수되었습니다.\n담당자 검토 후 결과를 제공해 드리겠습니다.\n\n감사합니다.\nResearchOn 팀`,
  });
}

export function notifyRequestCompleted(email: string, keywords: string) {
  return sendEmail({
    to: email,
    subject: '[ResearchOn] 연구 설계 결과가 등록되었습니다',
    body: `안녕하세요.\n\n'${keywords}' 관련 연구 설계 분석이 완료되었습니다.\nResearchOn에 접속하여 결과를 확인해주세요.\n\n감사합니다.\nResearchOn 팀`,
  });
}

export function notifyNewMessage(email: string, keywords: string) {
  return sendEmail({
    to: email,
    subject: '[ResearchOn] 새로운 메시지가 도착했습니다',
    body: `안녕하세요.\n\n'${keywords}' 의뢰 건에 담당자의 새로운 메시지가 있습니다.\nResearchOn에 접속하여 확인해주세요.\n\n감사합니다.\nResearchOn 팀`,
  });
}

-- ============================================
-- ResearchOn Supabase Schema
-- ============================================

-- 1. 프로젝트
CREATE TABLE projects (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  case_count INT DEFAULT 0,
  coded_count INT DEFAULT 0
);

-- 2. 판결문 케이스
CREATE TABLE cases (
  id TEXT PRIMARY KEY,
  project_id TEXT REFERENCES projects(id) ON DELETE CASCADE,
  data JSONB DEFAULT '{}'
);

-- 3. 다이어드 (사건별 인시던트)
CREATE TABLE dyads (
  id TEXT PRIMARY KEY,
  case_id TEXT,
  project_id TEXT REFERENCES projects(id) ON DELETE CASCADE,
  incidents JSONB DEFAULT '[]',
  event_duration JSONB DEFAULT '[]',
  gap JSONB DEFAULT '[]'
);

-- 4. 서비스 의뢰 (모든 유형 통합)
CREATE TABLE service_requests (
  id TEXT PRIMARY KEY,
  service_type TEXT NOT NULL,
  email TEXT DEFAULT '',
  status TEXT DEFAULT 'pending',
  data JSONB DEFAULT '{}',
  admin_response TEXT DEFAULT '',
  responded_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. 채팅 메시지
CREATE TABLE chat_messages (
  id TEXT PRIMARY KEY,
  service_type TEXT NOT NULL,
  request_id TEXT NOT NULL,
  sender TEXT NOT NULL,
  message TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. 크레딧
CREATE TABLE credits (
  id INT PRIMARY KEY DEFAULT 1,
  balance INT DEFAULT 100
);

CREATE TABLE credit_transactions (
  id TEXT PRIMARY KEY,
  type TEXT NOT NULL,
  amount INT NOT NULL,
  description TEXT DEFAULT '',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 초기 크레딧 데이터
INSERT INTO credits (id, balance) VALUES (1, 100);

-- 7. 문의사항
CREATE TABLE contact_inquiries (
  id TEXT PRIMARY KEY,
  email TEXT DEFAULT '',
  name TEXT DEFAULT '',
  category TEXT DEFAULT '',
  subject TEXT DEFAULT '',
  message TEXT DEFAULT '',
  status TEXT DEFAULT 'pending',
  admin_reply TEXT DEFAULT '',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  replied_at TIMESTAMPTZ
);

-- 인덱스
CREATE INDEX idx_cases_project ON cases(project_id);
CREATE INDEX idx_dyads_project ON dyads(project_id);
CREATE INDEX idx_dyads_case ON dyads(case_id);
CREATE INDEX idx_service_requests_type ON service_requests(service_type);
CREATE INDEX idx_service_requests_status ON service_requests(status);
CREATE INDEX idx_chat_messages_request ON chat_messages(request_id);
CREATE INDEX idx_chat_messages_type ON chat_messages(service_type);

-- RLS 비활성화 (서버사이드 전용)
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE cases ENABLE ROW LEVEL SECURITY;
ALTER TABLE dyads ENABLE ROW LEVEL SECURITY;
ALTER TABLE service_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE credits ENABLE ROW LEVEL SECURITY;
ALTER TABLE credit_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE contact_inquiries ENABLE ROW LEVEL SECURITY;

-- 모든 테이블에 anon 접근 허용 (서버사이드 API에서만 호출)
CREATE POLICY "Allow all" ON projects FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all" ON cases FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all" ON dyads FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all" ON service_requests FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all" ON chat_messages FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all" ON credits FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all" ON credit_transactions FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all" ON contact_inquiries FOR ALL USING (true) WITH CHECK (true);

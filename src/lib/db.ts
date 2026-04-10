import { supabase } from './supabase';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface Project {
  id: string;
  name: string;
  createdAt: string;
  caseCount: number;
  codedCount: number;
}

export type CaseStatus =
  | 'pending'
  | 'checking'
  | 'available'
  | 'unavailable'
  | 'fetched'
  | 'coding'
  | 'coded'
  | 'reviewed'
  | 'error';

export interface Case {
  id: string;
  projectId: string;

  // identification
  key: number;
  case_id: string;
  court: string;
  case_no: string;
  judgment_date: string;
  final_instance: string;

  status: CaseStatus;
  sourceText: string;
  casenoteUrl: string;
  lboxUrl: string;
  errorMessage: string;

  // offender
  sex: string;
  age: number | null;
  employment: string;
  nationality: string;

  // victim
  victim_sex: string;
  victim_age: number | null;
  total_victims: number | null;

  // relationship
  rel_type: string;
  rel_type_code: number | null;
  rel_status_first: string;
  rel_start_date: string;
  rel_end_date: string;
  cohabit_at_first: string;
  cohabit_ever: string;

  // coercive control
  cc_surveillance: number | null;
  cc_isolation: number | null;
  cc_intimidation: number | null;
  cc_emotional_abuse: number | null;
  cc_digital_control: number | null;
  cc_reputation_threat: number | null;
  cc_refusal_to_separate: number | null;
  cc_physical_control: number | null;
  cc_economic_control: number | null;

  // sentencing
  disposition: string;
  disposition_code: number | null;
  prison_months: number | null;
  probation_months: number | null;
  fine_10k: number | null;
  admit: string;
  admit_code: number | null;
  settlement: string;
  deposit: string;
  deposit_amount: number | null;
  victim_punishment_wish: string;
  sentencing_text: string;

  // derived (calculated)
  rel_duration_days: number | null;
  max_event_seq: number | null;
  total_offense_count: number | null;
  total_offense_span: number | null;
  mean_gap_days: number | null;
  gap_trend: string;
  gap_trend_code: number | null;
  severity_first: number | null;
  severity_last: number | null;
  severity_max: number | null;
  escalation_present: number | null;
  cc_total: number | null;
  rel_start_to_first_days: number | null;
  breakup_to_first_days: number | null;
}

/** Per-incident variables (up to 10 incidents per case) */
export interface Incident {
  seq: number; // 1-10
  main_charge: string;
  charge_cat: string;
  event_start: string;
  event_end: string;
  severity: number | null;
  harm_level: number | null;
  weapon: string;
  body_force_type: string;
  trigger_cat: string;
  injury: string;
  treatment_days: number | null;
  digital_means: string;
  date_imputed: string;
}

export interface Dyad {
  id: string;
  caseId: string;
  projectId: string;
  incidents: Incident[];

  // per-incident gap fields (calculated)
  event_duration: (number | null)[]; // event_duration_N
  gap: (number | null)[];            // gap_NtoN+1
}

// ---------------------------------------------------------------------------
// Service Request Interfaces
// ---------------------------------------------------------------------------

export interface ResearchRequest {
  id: string;
  keywords: string;
  description: string;
  field: string;
  email: string;
  status: 'pending' | 'received' | 'in_progress' | 'completed';
  createdAt: string;
  aiDraft: string;
  adminResponse: string;
  respondedAt: string;
}

export interface ChatMessage {
  id: string;
  requestId: string;
  sender: 'user' | 'admin';
  message: string;
  createdAt: string;
}

export interface StatsDesignRequest {
  id: string;
  email: string;
  researchType: string;
  dataType: string;
  sampleInfo: string;
  variables: string;
  analysisGoal: string;
  currentMethods: string;
  description: string;
  status: 'pending' | 'received' | 'in_progress' | 'completed';
  createdAt: string;
  adminResponse: string;
  respondedAt: string;
}

export interface SurveyRequest {
  id: string;
  email: string;
  title: string;
  purpose: string;
  requesterName: string;
  organization: string;
  population: string;
  sampleSize: string;
  samplingMethod: string;
  startDate: string;
  endDate: string;
  irbStatus: string;
  additionalRequests: string;
  surveyData: string;
  status: 'pending' | 'received' | 'in_progress' | 'completed';
  createdAt: string;
  adminResponse: string;
  respondedAt: string;
}

export interface JudgmentCollectionRequest {
  id: string;
  email: string;
  name: string;
  organization: string;
  purpose: string;
  searchType: 'caseNumber' | 'keyword';
  // case number search
  caseNumbers: string;
  scopeFirst: boolean;
  scopeSecond: boolean;
  scopeThird: boolean;
  outputFormat: string;
  // keyword search
  keywords: string;         // JSON array string
  keywordLogic: string;
  courts: string;           // JSON array string
  startYear: number;
  endYear: number;
  caseTypes: string;        // JSON array string
  lawKeyword: string;
  maxCount: number;
  // common
  additionalNotes: string;
  status: 'pending' | 'received' | 'in_progress' | 'completed';
  createdAt: string;
  adminResponse: string;
  respondedAt: string;
}

export interface NewsCollectionRequest {
  id: string;
  email: string;
  searchType: 'keyword' | 'sentence';
  keywords: string;        // JSON array for keyword type, or sentence string
  keywordLogic: string;    // AND/OR
  dateFrom: string;
  dateTo: string;
  maxCount: number;
  purpose: string;
  additionalNotes: string;
  status: 'pending' | 'received' | 'in_progress' | 'completed';
  createdAt: string;
  adminResponse: string;
  respondedAt: string;
}

export interface DataTransformRequest {
  id: string;
  email: string;
  dataDescription: string;
  dataFormat: string;
  currentState: string;
  transformationTypes: string; // JSON array
  transformationDetail: string;
  additionalNotes: string;
  status: 'pending' | 'received' | 'in_progress' | 'completed';
  createdAt: string;
  adminResponse: string;
  respondedAt: string;
}

export interface QuantAnalysisRequest {
  id: string;
  email: string;
  analysisType: string;
  dataDescription: string;
  variables: string;
  hypothesis: string;
  dataFormat: string;
  additionalNotes: string;
  status: 'pending' | 'received' | 'in_progress' | 'completed';
  createdAt: string;
  adminResponse: string;
  respondedAt: string;
}

export interface TextAnalysisRequest {
  id: string;
  email: string;
  analysisTypes: string; // JSON array of selected analysis types
  dataInputMethod: string;
  textContent: string;
  analysisOptions: string; // JSON object of per-analysis options
  additionalNotes: string;
  status: 'pending' | 'received' | 'in_progress' | 'completed';
  createdAt: string;
  adminResponse: string;
  respondedAt: string;
}

export interface QualAnalysisRequest {
  id: string;
  email: string;
  analysisType: string;
  dataDescription: string;
  dataFormat: string;
  analysisGoal: string;
  additionalNotes: string;
  status: 'pending' | 'received' | 'in_progress' | 'completed';
  createdAt: string;
  adminResponse: string;
  respondedAt: string;
}

export interface ContactInquiry {
  id: string;
  email: string;
  name: string;
  category: string;
  subject: string;
  message: string;
  status: 'pending' | 'replied';
  createdAt: string;
  adminReply: string;
  repliedAt: string;
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

function defaultCase(partial: Partial<Case> & { id: string; projectId: string }): Case {
  return {
    key: 0,
    case_id: '',
    court: '',
    case_no: '',
    judgment_date: '',
    final_instance: '',
    status: 'pending',
    sourceText: '',
    casenoteUrl: '',
    lboxUrl: '',
    errorMessage: '',
    sex: '',
    age: null,
    employment: '',
    nationality: '',
    victim_sex: '',
    victim_age: null,
    total_victims: null,
    rel_type: '',
    rel_type_code: null,
    rel_status_first: '',
    rel_start_date: '',
    rel_end_date: '',
    cohabit_at_first: '',
    cohabit_ever: '',
    cc_surveillance: null,
    cc_isolation: null,
    cc_intimidation: null,
    cc_emotional_abuse: null,
    cc_digital_control: null,
    cc_reputation_threat: null,
    cc_refusal_to_separate: null,
    cc_physical_control: null,
    cc_economic_control: null,
    disposition: '',
    disposition_code: null,
    prison_months: null,
    probation_months: null,
    fine_10k: null,
    admit: '',
    admit_code: null,
    settlement: '',
    deposit: '',
    deposit_amount: null,
    victim_punishment_wish: '',
    sentencing_text: '',
    rel_duration_days: null,
    max_event_seq: null,
    total_offense_count: null,
    total_offense_span: null,
    mean_gap_days: null,
    gap_trend: '',
    gap_trend_code: null,
    severity_first: null,
    severity_last: null,
    severity_max: null,
    escalation_present: null,
    cc_total: null,
    rel_start_to_first_days: null,
    breakup_to_first_days: null,
    ...partial,
  };
}

// ---------------------------------------------------------------------------
// Generic Service Request helpers
// ---------------------------------------------------------------------------

// Common columns stored directly in the service_requests table
const SERVICE_COMMON_KEYS = ['id', 'email', 'status', 'adminResponse', 'respondedAt', 'createdAt'] as const;

/**
 * Convert a DB row from service_requests into a typed service request object.
 * Common fields come from dedicated columns; everything else from the `data` JSONB.
 */
function rowToServiceRequest<T>(row: Record<string, unknown>): T {
  const obj: Record<string, unknown> = {
    id: row.id,
    email: row.email ?? '',
    status: row.status ?? 'pending',
    adminResponse: row.admin_response ?? '',
    respondedAt: row.responded_at ?? '',
    createdAt: row.created_at ?? '',
    ...(row.data as Record<string, unknown> ?? {}),
  };
  return obj as T;
}

/**
 * Convert a typed service request into DB columns + data JSONB for upsert.
 */
function serviceRequestToRow(serviceType: string, obj: Record<string, unknown>): Record<string, unknown> {
  const row: Record<string, unknown> = {
    id: obj.id,
    service_type: serviceType,
    email: obj.email ?? '',
    status: obj.status ?? 'pending',
    admin_response: obj.adminResponse ?? '',
    responded_at: obj.respondedAt || null,
    created_at: obj.createdAt ?? new Date().toISOString(),
  };
  // Everything else goes into data JSONB
  const data: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(obj)) {
    if (!SERVICE_COMMON_KEYS.includes(k as typeof SERVICE_COMMON_KEYS[number])) {
      data[k] = v;
    }
  }
  row.data = data;
  return row;
}

async function _getServiceRequests<T>(serviceType: string, email?: string): Promise<T[]> {
  let query = supabase
    .from('service_requests')
    .select('*')
    .eq('service_type', serviceType);
  if (email) {
    query = query.eq('email', email);
  }
  const { data, error } = await query.order('created_at', { ascending: false });
  if (error) throw error;
  return (data ?? []).map((row: Record<string, unknown>) => rowToServiceRequest<T>(row));
}

async function _getServiceRequest<T>(serviceType: string, id: string): Promise<T | undefined> {
  const { data, error } = await supabase
    .from('service_requests')
    .select('*')
    .eq('service_type', serviceType)
    .eq('id', id)
    .single();
  if (error) {
    if (error.code === 'PGRST116') return undefined; // not found
    throw error;
  }
  return data ? rowToServiceRequest<T>(data as Record<string, unknown>) : undefined;
}

async function _createServiceRequest<T>(serviceType: string, obj: Record<string, unknown>): Promise<T> {
  const id = generateId();
  const full: Record<string, unknown> = {
    ...obj,
    id,
    status: 'pending',
    createdAt: new Date().toISOString(),
    adminResponse: '',
    respondedAt: '',
  };
  const row = serviceRequestToRow(serviceType, full);
  const { data, error } = await supabase
    .from('service_requests')
    .insert(row)
    .select()
    .single();
  if (error) throw error;
  return rowToServiceRequest<T>(data as Record<string, unknown>);
}

async function _updateServiceRequest<T>(serviceType: string, id: string, patch: Record<string, unknown>): Promise<T | undefined> {
  // Fetch current row first
  const current = await _getServiceRequest<Record<string, unknown>>(serviceType, id);
  if (!current) return undefined;

  const merged: Record<string, unknown> = { ...current, ...patch, id };
  const row = serviceRequestToRow(serviceType, merged);
  // Remove service_type from update payload (it's a filter, not updatable)
  delete row.service_type;

  const { data, error } = await supabase
    .from('service_requests')
    .update(row)
    .eq('id', id)
    .eq('service_type', serviceType)
    .select()
    .single();
  if (error) throw error;
  return data ? rowToServiceRequest<T>(data as Record<string, unknown>) : undefined;
}

// ---------------------------------------------------------------------------
// Generic Chat Message helpers
// ---------------------------------------------------------------------------

async function _getMessages(serviceType: string, requestId: string): Promise<ChatMessage[]> {
  const { data, error } = await supabase
    .from('chat_messages')
    .select('*')
    .eq('service_type', serviceType)
    .eq('request_id', requestId)
    .order('created_at', { ascending: true });
  if (error) throw error;
  return (data ?? []).map((row: Record<string, unknown>) => ({
    id: row.id as string,
    requestId: row.request_id as string,
    sender: row.sender as 'user' | 'admin',
    message: row.message as string,
    createdAt: row.created_at as string,
  }));
}

async function _addMessage(serviceType: string, requestId: string, sender: 'user' | 'admin', message: string): Promise<ChatMessage> {
  const id = generateId();
  const { data, error } = await supabase
    .from('chat_messages')
    .insert({
      id,
      service_type: serviceType,
      request_id: requestId,
      sender,
      message,
      created_at: new Date().toISOString(),
    })
    .select()
    .single();
  if (error) throw error;
  return {
    id: data.id,
    requestId: data.request_id,
    sender: data.sender as 'user' | 'admin',
    message: data.message,
    createdAt: data.created_at,
  };
}

// ---------------------------------------------------------------------------
// Project CRUD
// ---------------------------------------------------------------------------

export async function getProjects(): Promise<Project[]> {
  const { data, error } = await supabase
    .from('projects')
    .select('*')
    .order('created_at', { ascending: false });
  if (error) throw error;
  return (data ?? []).map((row: Record<string, unknown>) => ({
    id: row.id as string,
    name: row.name as string,
    createdAt: row.created_at as string,
    caseCount: (row.case_count as number) ?? 0,
    codedCount: (row.coded_count as number) ?? 0,
  }));
}

export async function getProject(id: string): Promise<Project | undefined> {
  const { data, error } = await supabase
    .from('projects')
    .select('*')
    .eq('id', id)
    .single();
  if (error) {
    if (error.code === 'PGRST116') return undefined;
    throw error;
  }
  if (!data) return undefined;
  return {
    id: data.id,
    name: data.name,
    createdAt: data.created_at,
    caseCount: data.case_count ?? 0,
    codedCount: data.coded_count ?? 0,
  };
}

export async function createProject(name: string): Promise<Project> {
  const id = generateId();
  const now = new Date().toISOString();
  const { data, error } = await supabase
    .from('projects')
    .insert({ id, name, created_at: now, case_count: 0, coded_count: 0 })
    .select()
    .single();
  if (error) throw error;
  return {
    id: data.id,
    name: data.name,
    createdAt: data.created_at,
    caseCount: data.case_count ?? 0,
    codedCount: data.coded_count ?? 0,
  };
}

export async function deleteProject(id: string): Promise<boolean> {
  // Delete related cases and dyads first
  await supabase.from('dyads').delete().eq('project_id', id);
  await supabase.from('cases').delete().eq('project_id', id);

  const { error, count } = await supabase
    .from('projects')
    .delete()
    .eq('id', id);
  if (error) throw error;
  // count may be null depending on settings; if no error, consider success
  return true;
}

export async function updateProject(id: string, patch: Partial<Project>): Promise<Project | undefined> {
  const row: Record<string, unknown> = {};
  if (patch.name !== undefined) row.name = patch.name;
  if (patch.caseCount !== undefined) row.case_count = patch.caseCount;
  if (patch.codedCount !== undefined) row.coded_count = patch.codedCount;
  if (patch.createdAt !== undefined) row.created_at = patch.createdAt;

  const { data, error } = await supabase
    .from('projects')
    .update(row)
    .eq('id', id)
    .select()
    .single();
  if (error) {
    if (error.code === 'PGRST116') return undefined;
    throw error;
  }
  if (!data) return undefined;
  return {
    id: data.id,
    name: data.name,
    createdAt: data.created_at,
    caseCount: data.case_count ?? 0,
    codedCount: data.coded_count ?? 0,
  };
}

// ---------------------------------------------------------------------------
// Case CRUD
// ---------------------------------------------------------------------------

function caseFromRow(row: Record<string, unknown>): Case {
  const data = (row.data as Record<string, unknown>) ?? {};
  return defaultCase({
    id: row.id as string,
    projectId: row.project_id as string,
    ...data,
  } as Partial<Case> & { id: string; projectId: string });
}

function caseToRow(c: Case): Record<string, unknown> {
  const { id, projectId, ...rest } = c;
  return {
    id,
    project_id: projectId,
    data: rest,
  };
}

export async function getCases(projectId: string): Promise<Case[]> {
  const { data, error } = await supabase
    .from('cases')
    .select('*')
    .eq('project_id', projectId);
  if (error) throw error;
  return (data ?? []).map((row: Record<string, unknown>) => caseFromRow(row));
}

export async function getCase(projectId: string, caseId: string): Promise<Case | undefined> {
  const { data, error } = await supabase
    .from('cases')
    .select('*')
    .eq('project_id', projectId)
    .eq('id', caseId)
    .single();
  if (error) {
    if (error.code === 'PGRST116') return undefined;
    throw error;
  }
  return data ? caseFromRow(data as Record<string, unknown>) : undefined;
}

export async function createCase(projectId: string, data: Partial<Case>): Promise<Case> {
  const c = defaultCase({ ...data, id: generateId(), projectId });
  const row = caseToRow(c);
  const { error } = await supabase.from('cases').insert(row);
  if (error) throw error;

  // Update project case count
  const { count } = await supabase
    .from('cases')
    .select('*', { count: 'exact', head: true })
    .eq('project_id', projectId);
  await updateProject(projectId, { caseCount: count ?? 0 });

  return c;
}

export async function createCases(projectId: string, dataList: Partial<Case>[]): Promise<Case[]> {
  const created: Case[] = [];
  const rows: Record<string, unknown>[] = [];
  for (const d of dataList) {
    const c = defaultCase({ ...d, id: generateId(), projectId });
    created.push(c);
    rows.push(caseToRow(c));
  }
  if (rows.length > 0) {
    const { error } = await supabase.from('cases').insert(rows);
    if (error) throw error;
  }

  // Update project case count
  const { count } = await supabase
    .from('cases')
    .select('*', { count: 'exact', head: true })
    .eq('project_id', projectId);
  await updateProject(projectId, { caseCount: count ?? 0 });

  return created;
}

export async function updateCase(projectId: string, caseId: string, patch: Partial<Case>): Promise<Case | undefined> {
  const existing = await getCase(projectId, caseId);
  if (!existing) return undefined;

  const merged = { ...existing, ...patch, id: caseId, projectId };
  const row = caseToRow(merged);
  delete row.id; // don't update PK
  delete row.project_id;

  const { error } = await supabase
    .from('cases')
    .update(row)
    .eq('id', caseId)
    .eq('project_id', projectId);
  if (error) throw error;

  // Update coded count
  const { count } = await supabase
    .from('cases')
    .select('*', { count: 'exact', head: true })
    .eq('project_id', projectId)
    .in('data->>status', ['coded', 'reviewed']);
  await updateProject(projectId, { codedCount: count ?? 0 });

  return merged;
}

// ---------------------------------------------------------------------------
// Dyad CRUD
// ---------------------------------------------------------------------------

function dyadFromRow(row: Record<string, unknown>): Dyad {
  return {
    id: row.id as string,
    caseId: row.case_id as string,
    projectId: row.project_id as string,
    incidents: (row.incidents as Incident[]) ?? [],
    event_duration: (row.event_duration as (number | null)[]) ?? [],
    gap: (row.gap as (number | null)[]) ?? [],
  };
}

export async function getDyads(projectId: string): Promise<Dyad[]> {
  const { data, error } = await supabase
    .from('dyads')
    .select('*')
    .eq('project_id', projectId);
  if (error) throw error;
  return (data ?? []).map((row: Record<string, unknown>) => dyadFromRow(row));
}

export async function getDyad(projectId: string, dyadId: string): Promise<Dyad | undefined> {
  const { data, error } = await supabase
    .from('dyads')
    .select('*')
    .eq('project_id', projectId)
    .eq('id', dyadId)
    .single();
  if (error) {
    if (error.code === 'PGRST116') return undefined;
    throw error;
  }
  return data ? dyadFromRow(data as Record<string, unknown>) : undefined;
}

export async function getDyadByCase(projectId: string, caseId: string): Promise<Dyad | undefined> {
  const { data, error } = await supabase
    .from('dyads')
    .select('*')
    .eq('project_id', projectId)
    .eq('case_id', caseId)
    .single();
  if (error) {
    if (error.code === 'PGRST116') return undefined;
    throw error;
  }
  return data ? dyadFromRow(data as Record<string, unknown>) : undefined;
}

export async function createDyad(projectId: string, caseId: string, incidents: Incident[] = []): Promise<Dyad> {
  const id = generateId();
  const dyad: Dyad = { id, caseId, projectId, incidents, event_duration: [], gap: [] };
  const { error } = await supabase.from('dyads').insert({
    id,
    case_id: caseId,
    project_id: projectId,
    incidents,
    event_duration: [],
    gap: [],
  });
  if (error) throw error;
  return dyad;
}

export async function updateDyad(projectId: string, dyadId: string, patch: Partial<Dyad>): Promise<Dyad | undefined> {
  const existing = await getDyad(projectId, dyadId);
  if (!existing) return undefined;

  const merged = { ...existing, ...patch, id: dyadId, projectId };
  const row: Record<string, unknown> = {};
  if (patch.caseId !== undefined) row.case_id = patch.caseId;
  if (patch.incidents !== undefined) row.incidents = patch.incidents;
  if (patch.event_duration !== undefined) row.event_duration = patch.event_duration;
  if (patch.gap !== undefined) row.gap = patch.gap;

  if (Object.keys(row).length > 0) {
    const { error } = await supabase
      .from('dyads')
      .update(row)
      .eq('id', dyadId)
      .eq('project_id', projectId);
    if (error) throw error;
  }

  return merged;
}

// ---------------------------------------------------------------------------
// Research Design Request
// ---------------------------------------------------------------------------

export async function getResearchRequests(email?: string): Promise<ResearchRequest[]> {
  return _getServiceRequests<ResearchRequest>('research-design', email);
}

export async function getResearchRequest(id: string): Promise<ResearchRequest | undefined> {
  return _getServiceRequest<ResearchRequest>('research-design', id);
}

export async function createResearchRequest(data: { keywords: string; description: string; field: string; email: string }): Promise<ResearchRequest> {
  return _createServiceRequest<ResearchRequest>('research-design', { ...data, aiDraft: '' });
}

export async function updateResearchRequest(id: string, patch: Partial<ResearchRequest>): Promise<ResearchRequest | undefined> {
  return _updateServiceRequest<ResearchRequest>('research-design', id, patch as Record<string, unknown>);
}

// Research Chat Messages
export async function getChatMessages(requestId: string): Promise<ChatMessage[]> {
  return _getMessages('research-design', requestId);
}

export async function addChatMessage(requestId: string, sender: 'user' | 'admin', message: string): Promise<ChatMessage> {
  return _addMessage('research-design', requestId, sender, message);
}

// ---------------------------------------------------------------------------
// Stats Design Request
// ---------------------------------------------------------------------------

export async function getStatsDesignRequests(email?: string): Promise<StatsDesignRequest[]> {
  return _getServiceRequests<StatsDesignRequest>('stats-design', email);
}

export async function getStatsDesignRequest(id: string): Promise<StatsDesignRequest | undefined> {
  return _getServiceRequest<StatsDesignRequest>('stats-design', id);
}

export async function createStatsDesignRequest(data: {
  email: string;
  researchType: string;
  dataType: string;
  sampleInfo: string;
  variables: string;
  analysisGoal: string;
  currentMethods: string;
  description: string;
}): Promise<StatsDesignRequest> {
  return _createServiceRequest<StatsDesignRequest>('stats-design', data);
}

export async function updateStatsDesignRequest(id: string, patch: Partial<StatsDesignRequest>): Promise<StatsDesignRequest | undefined> {
  return _updateServiceRequest<StatsDesignRequest>('stats-design', id, patch as Record<string, unknown>);
}

// Stats Design Chat Messages
export async function getStatsDesignMessages(requestId: string): Promise<ChatMessage[]> {
  return _getMessages('stats-design', requestId);
}

export async function addStatsDesignMessage(requestId: string, sender: 'user' | 'admin', message: string): Promise<ChatMessage> {
  return _addMessage('stats-design', requestId, sender, message);
}

// ---------------------------------------------------------------------------
// Survey Request
// ---------------------------------------------------------------------------

export async function getSurveyRequests(email?: string): Promise<SurveyRequest[]> {
  return _getServiceRequests<SurveyRequest>('survey', email);
}

export async function getSurveyRequest(id: string): Promise<SurveyRequest | undefined> {
  return _getServiceRequest<SurveyRequest>('survey', id);
}

export async function createSurveyRequest(data: Omit<SurveyRequest, 'id' | 'status' | 'createdAt' | 'adminResponse' | 'respondedAt'>): Promise<SurveyRequest> {
  return _createServiceRequest<SurveyRequest>('survey', data as Record<string, unknown>);
}

export async function updateSurveyRequest(id: string, patch: Partial<SurveyRequest>): Promise<SurveyRequest | undefined> {
  return _updateServiceRequest<SurveyRequest>('survey', id, patch as Record<string, unknown>);
}

// Survey Chat Messages
export async function getSurveyMessages(requestId: string): Promise<ChatMessage[]> {
  return _getMessages('survey', requestId);
}

export async function addSurveyMessage(requestId: string, sender: 'user' | 'admin', message: string): Promise<ChatMessage> {
  return _addMessage('survey', requestId, sender, message);
}

// ---------------------------------------------------------------------------
// Judgment Collection Request
// ---------------------------------------------------------------------------

export async function getJudgmentCollectionRequests(email?: string): Promise<JudgmentCollectionRequest[]> {
  return _getServiceRequests<JudgmentCollectionRequest>('judgment-collection', email);
}

export async function getJudgmentCollectionRequest(id: string): Promise<JudgmentCollectionRequest | undefined> {
  return _getServiceRequest<JudgmentCollectionRequest>('judgment-collection', id);
}

export async function createJudgmentCollectionRequest(
  data: Omit<JudgmentCollectionRequest, 'id' | 'status' | 'createdAt' | 'adminResponse' | 'respondedAt'>,
): Promise<JudgmentCollectionRequest> {
  return _createServiceRequest<JudgmentCollectionRequest>('judgment-collection', data as Record<string, unknown>);
}

export async function updateJudgmentCollectionRequest(id: string, patch: Partial<JudgmentCollectionRequest>): Promise<JudgmentCollectionRequest | undefined> {
  return _updateServiceRequest<JudgmentCollectionRequest>('judgment-collection', id, patch as Record<string, unknown>);
}

// Judgment Collection Chat Messages
export async function getJudgmentCollectionMessages(requestId: string): Promise<ChatMessage[]> {
  return _getMessages('judgment-collection', requestId);
}

export async function addJudgmentCollectionMessage(requestId: string, sender: 'user' | 'admin', message: string): Promise<ChatMessage> {
  return _addMessage('judgment-collection', requestId, sender, message);
}

// ---------------------------------------------------------------------------
// News Collection Request
// ---------------------------------------------------------------------------

export async function getNewsCollectionRequests(email?: string): Promise<NewsCollectionRequest[]> {
  return _getServiceRequests<NewsCollectionRequest>('news-collection', email);
}

export async function getNewsCollectionRequest(id: string): Promise<NewsCollectionRequest | undefined> {
  return _getServiceRequest<NewsCollectionRequest>('news-collection', id);
}

export async function createNewsCollectionRequest(
  data: Omit<NewsCollectionRequest, 'id' | 'status' | 'createdAt' | 'adminResponse' | 'respondedAt'>,
): Promise<NewsCollectionRequest> {
  return _createServiceRequest<NewsCollectionRequest>('news-collection', data as Record<string, unknown>);
}

export async function updateNewsCollectionRequest(id: string, patch: Partial<NewsCollectionRequest>): Promise<NewsCollectionRequest | undefined> {
  return _updateServiceRequest<NewsCollectionRequest>('news-collection', id, patch as Record<string, unknown>);
}

// News Collection Chat Messages
export async function getNewsCollectionMessages(requestId: string): Promise<ChatMessage[]> {
  return _getMessages('news-collection', requestId);
}

export async function addNewsCollectionMessage(requestId: string, sender: 'user' | 'admin', message: string): Promise<ChatMessage> {
  return _addMessage('news-collection', requestId, sender, message);
}

// ---------------------------------------------------------------------------
// Data Transform Request
// ---------------------------------------------------------------------------

export async function getDataTransformRequests(email?: string): Promise<DataTransformRequest[]> {
  return _getServiceRequests<DataTransformRequest>('data-transform', email);
}

export async function getDataTransformRequest(id: string): Promise<DataTransformRequest | undefined> {
  return _getServiceRequest<DataTransformRequest>('data-transform', id);
}

export async function createDataTransformRequest(
  data: Omit<DataTransformRequest, 'id' | 'status' | 'createdAt' | 'adminResponse' | 'respondedAt'>,
): Promise<DataTransformRequest> {
  return _createServiceRequest<DataTransformRequest>('data-transform', data as Record<string, unknown>);
}

export async function updateDataTransformRequest(id: string, patch: Partial<DataTransformRequest>): Promise<DataTransformRequest | undefined> {
  return _updateServiceRequest<DataTransformRequest>('data-transform', id, patch as Record<string, unknown>);
}

// Data Transform Chat Messages
export async function getDataTransformMessages(requestId: string): Promise<ChatMessage[]> {
  return _getMessages('data-transform', requestId);
}

export async function addDataTransformMessage(requestId: string, sender: 'user' | 'admin', message: string): Promise<ChatMessage> {
  return _addMessage('data-transform', requestId, sender, message);
}

// ---------------------------------------------------------------------------
// Quant Analysis Request
// ---------------------------------------------------------------------------

export async function getQuantAnalysisRequests(email?: string): Promise<QuantAnalysisRequest[]> {
  return _getServiceRequests<QuantAnalysisRequest>('quant-analysis', email);
}

export async function getQuantAnalysisRequest(id: string): Promise<QuantAnalysisRequest | undefined> {
  return _getServiceRequest<QuantAnalysisRequest>('quant-analysis', id);
}

export async function createQuantAnalysisRequest(
  data: Omit<QuantAnalysisRequest, 'id' | 'status' | 'createdAt' | 'adminResponse' | 'respondedAt'>,
): Promise<QuantAnalysisRequest> {
  return _createServiceRequest<QuantAnalysisRequest>('quant-analysis', data as Record<string, unknown>);
}

export async function updateQuantAnalysisRequest(id: string, patch: Partial<QuantAnalysisRequest>): Promise<QuantAnalysisRequest | undefined> {
  return _updateServiceRequest<QuantAnalysisRequest>('quant-analysis', id, patch as Record<string, unknown>);
}

// Quant Analysis Chat Messages
export async function getQuantAnalysisMessages(requestId: string): Promise<ChatMessage[]> {
  return _getMessages('quant-analysis', requestId);
}

export async function addQuantAnalysisMessage(requestId: string, sender: 'user' | 'admin', message: string): Promise<ChatMessage> {
  return _addMessage('quant-analysis', requestId, sender, message);
}

// ---------------------------------------------------------------------------
// Text Analysis Request
// ---------------------------------------------------------------------------

export async function getTextAnalysisRequests(email?: string): Promise<TextAnalysisRequest[]> {
  return _getServiceRequests<TextAnalysisRequest>('text-analysis-request', email);
}

export async function getTextAnalysisRequest(id: string): Promise<TextAnalysisRequest | undefined> {
  return _getServiceRequest<TextAnalysisRequest>('text-analysis-request', id);
}

export async function createTextAnalysisRequest(
  data: Omit<TextAnalysisRequest, 'id' | 'status' | 'createdAt' | 'adminResponse' | 'respondedAt'>,
): Promise<TextAnalysisRequest> {
  return _createServiceRequest<TextAnalysisRequest>('text-analysis-request', data as Record<string, unknown>);
}

export async function updateTextAnalysisRequest(id: string, patch: Partial<TextAnalysisRequest>): Promise<TextAnalysisRequest | undefined> {
  return _updateServiceRequest<TextAnalysisRequest>('text-analysis-request', id, patch as Record<string, unknown>);
}

// Text Analysis Chat Messages
export async function getTextAnalysisMessages(requestId: string): Promise<ChatMessage[]> {
  return _getMessages('text-analysis-request', requestId);
}

export async function addTextAnalysisMessage(requestId: string, sender: 'user' | 'admin', message: string): Promise<ChatMessage> {
  return _addMessage('text-analysis-request', requestId, sender, message);
}

// ---------------------------------------------------------------------------
// Qual Analysis Request
// ---------------------------------------------------------------------------

export async function getQualAnalysisRequests(email?: string): Promise<QualAnalysisRequest[]> {
  return _getServiceRequests<QualAnalysisRequest>('qual-analysis', email);
}

export async function getQualAnalysisRequest(id: string): Promise<QualAnalysisRequest | undefined> {
  return _getServiceRequest<QualAnalysisRequest>('qual-analysis', id);
}

export async function createQualAnalysisRequest(
  data: Omit<QualAnalysisRequest, 'id' | 'status' | 'createdAt' | 'adminResponse' | 'respondedAt'>,
): Promise<QualAnalysisRequest> {
  return _createServiceRequest<QualAnalysisRequest>('qual-analysis', data as Record<string, unknown>);
}

export async function updateQualAnalysisRequest(id: string, patch: Partial<QualAnalysisRequest>): Promise<QualAnalysisRequest | undefined> {
  return _updateServiceRequest<QualAnalysisRequest>('qual-analysis', id, patch as Record<string, unknown>);
}

// Qual Analysis Chat Messages
export async function getQualAnalysisMessages(requestId: string): Promise<ChatMessage[]> {
  return _getMessages('qual-analysis', requestId);
}

export async function addQualAnalysisMessage(requestId: string, sender: 'user' | 'admin', message: string): Promise<ChatMessage> {
  return _addMessage('qual-analysis', requestId, sender, message);
}

// ---------------------------------------------------------------------------
// Judgment Coding Request (프로젝트 기반 판결문 코딩 의뢰)
// ---------------------------------------------------------------------------

export async function getJudgmentCodingRequests(email?: string) {
  return _getServiceRequests<Record<string, unknown>>('judgment-coding', email);
}

export async function getJudgmentCodingRequest(id: string) {
  return _getServiceRequest<Record<string, unknown>>('judgment-coding', id);
}

export async function createJudgmentCodingRequest(
  data: Record<string, unknown>,
) {
  return _createServiceRequest<Record<string, unknown>>('judgment-coding', data);
}

export async function updateJudgmentCodingRequest(id: string, patch: Record<string, unknown>) {
  return _updateServiceRequest<Record<string, unknown>>('judgment-coding', id, patch);
}

export async function getJudgmentCodingMessages(requestId: string): Promise<ChatMessage[]> {
  return _getMessages('judgment-coding', requestId);
}

export async function addJudgmentCodingMessage(requestId: string, sender: 'user' | 'admin', message: string): Promise<ChatMessage> {
  return _addMessage('judgment-coding', requestId, sender, message);
}

// ---------------------------------------------------------------------------
// Contact Inquiries
// ---------------------------------------------------------------------------

export async function getContactInquiries(): Promise<ContactInquiry[]> {
  const { data, error } = await supabase
    .from('contact_inquiries')
    .select('*')
    .order('created_at', { ascending: false });
  if (error) throw error;
  return (data ?? []).map((row: Record<string, unknown>) => ({
    id: row.id as string,
    email: (row.email as string) ?? '',
    name: (row.name as string) ?? '',
    category: (row.category as string) ?? '',
    subject: (row.subject as string) ?? '',
    message: (row.message as string) ?? '',
    status: (row.status as 'pending' | 'replied') ?? 'pending',
    createdAt: (row.created_at as string) ?? '',
    adminReply: (row.admin_reply as string) ?? '',
    repliedAt: (row.replied_at as string) ?? '',
  }));
}

export async function getContactInquiry(id: string): Promise<ContactInquiry | undefined> {
  const { data, error } = await supabase
    .from('contact_inquiries')
    .select('*')
    .eq('id', id)
    .single();
  if (error) {
    if (error.code === 'PGRST116') return undefined;
    throw error;
  }
  if (!data) return undefined;
  return {
    id: data.id,
    email: data.email ?? '',
    name: data.name ?? '',
    category: data.category ?? '',
    subject: data.subject ?? '',
    message: data.message ?? '',
    status: data.status ?? 'pending',
    createdAt: data.created_at ?? '',
    adminReply: data.admin_reply ?? '',
    repliedAt: data.replied_at ?? '',
  };
}

export async function createContactInquiry(
  data: Omit<ContactInquiry, 'id' | 'status' | 'createdAt' | 'adminReply' | 'repliedAt'>,
): Promise<ContactInquiry> {
  const id = generateId();
  const now = new Date().toISOString();
  const { data: row, error } = await supabase
    .from('contact_inquiries')
    .insert({
      id,
      email: data.email,
      name: data.name,
      category: data.category,
      subject: data.subject,
      message: data.message,
      status: 'pending',
      created_at: now,
      admin_reply: '',
      replied_at: null,
    })
    .select()
    .single();
  if (error) throw error;
  return {
    id: row.id,
    email: row.email ?? '',
    name: row.name ?? '',
    category: row.category ?? '',
    subject: row.subject ?? '',
    message: row.message ?? '',
    status: row.status ?? 'pending',
    createdAt: row.created_at ?? '',
    adminReply: row.admin_reply ?? '',
    repliedAt: row.replied_at ?? '',
  };
}

export async function updateContactInquiry(id: string, patch: Partial<ContactInquiry>): Promise<ContactInquiry | undefined> {
  const row: Record<string, unknown> = {};
  if (patch.email !== undefined) row.email = patch.email;
  if (patch.name !== undefined) row.name = patch.name;
  if (patch.category !== undefined) row.category = patch.category;
  if (patch.subject !== undefined) row.subject = patch.subject;
  if (patch.message !== undefined) row.message = patch.message;
  if (patch.status !== undefined) row.status = patch.status;
  if (patch.adminReply !== undefined) row.admin_reply = patch.adminReply;
  if (patch.repliedAt !== undefined) row.replied_at = patch.repliedAt;

  const { data, error } = await supabase
    .from('contact_inquiries')
    .update(row)
    .eq('id', id)
    .select()
    .single();
  if (error) {
    if (error.code === 'PGRST116') return undefined;
    throw error;
  }
  if (!data) return undefined;
  return {
    id: data.id,
    email: data.email ?? '',
    name: data.name ?? '',
    category: data.category ?? '',
    subject: data.subject ?? '',
    message: data.message ?? '',
    status: data.status ?? 'pending',
    createdAt: data.created_at ?? '',
    adminReply: data.admin_reply ?? '',
    repliedAt: data.replied_at ?? '',
  };
}

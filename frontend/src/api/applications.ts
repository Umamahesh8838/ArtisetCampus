import client from './client';

export interface Application {
  application_id: number;
  student_id: number;
  jd_id: number;
  company_id: number;
  drive_id: number;
  applied_date: string;
  status: 'applied' | 'shortlisted' | 'rejected' | 'selected' | 'offer-extended' | 'offer-accepted' | 'offer-rejected' | 'placed';
  current_round_number: number;
  total_rounds: number;
  last_round_date?: string;
  notes?: string;
}

export interface CreateApplicationData {
  drive_id: number;
  jd_id: number;
  company_id: number;
}

export const applyToDrive = (data: CreateApplicationData) => {
  return client.post('/applications', data);
};

export const getApplicationById = (id: number | string) => {
  return client.get(`/applications/${id}`);
};

export const getMyApplications = (params?: any) => {
  return client.get('/applications/my', { params });
};

export const getAllApplications = (params?: any) => {
  return client.get('/applications', { params });
};

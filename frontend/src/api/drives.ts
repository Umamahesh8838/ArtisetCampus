import client from './client';

export interface Drive {
  drive_id: number;
  jd_id: number;
  drive_name: string;
  drive_start_date: string;
  drive_end_date: string;
  status: 'Draft' | 'Active' | 'Closed' | 'Archived';
  jd_title?: string;
  company_name?: string;
  created_at: string;
  updated_at: string;
}

export interface CreateDriveData {
  jd_id: number;
  drive_name: string;
  start_date: string;
  end_date: string;
  status?: string;
}

export const getDrives = (params?: any) => {
  return client.get('/drives', { params });
};

export const getDriveById = (id: number | string) => {
  return client.get(`/drives/${id}`);
};

export const createDrive = (data: CreateDriveData) => {
  return client.post('/drives', data);
};

export const updateDrive = (id: number | string, data: Partial<CreateDriveData>) => {
  return client.put(`/drives/${id}`, data);
};

export const deleteDrive = (id: number | string) => {
  return client.delete(`/drives/${id}`);
};

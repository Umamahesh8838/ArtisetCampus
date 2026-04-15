import client from './client';

export interface Company {
  company_id: number;
  company_name: string;
  spoc_email: string;
  phone: string;
  website?: string;
  description?: string;
  address?: string;
  city?: string;
  country?: string;
  spocUserId?: number;
  spocUserName?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface RecruitmentDrive {
  id: number;
  companyId: number;
  name: string;
  description: string;
  startDate: string;
  endDate: string;
  status: 'ACTIVE' | 'CLOSED' | 'DRAFT';
  createdAt: string;
}

export const companiesAPI = {
  // Get all companies
  getCompanies: (
    limit: number = 10,
    offset: number = 0,
    isActive?: boolean
  ) =>
    client.get<{ companies: Company[]; total: number }>('/companies', {
      params: { limit, offset, isActive },
    }),

  // Get company by ID
  getCompanyById: (id: number) =>
    client.get<{ company: Company }>(`/companies/${id}`),

  // Create company
  createCompany: (data: Partial<Company>) =>
    client.post<{ company: Company }>('/companies', data),

  // Update company
  updateCompany: (id: number, data: Partial<Company>) =>
    client.put<{ company: Company }>(`/companies/${id}`, data),

  // Delete company
  deleteCompany: (id: number) => client.delete(`/companies/${id}`),

  // Get recruitment drives for company
  getCompanyDrives: (
    companyId: number,
    limit: number = 10,
    offset: number = 0
  ) =>
    client.get<{ drives: RecruitmentDrive[]; total: number }>(
      `/companies/${companyId}/recruitment-drives`,
      { params: { limit, offset } }
    ),
};

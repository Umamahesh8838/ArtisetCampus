import { useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { useApi } from '../hooks/useApi';
import { companiesAPI } from '../api/companies';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';

export default function Companies() {
  const { user } = useAuth();
  const [filters, setFilters] = useState({
    isActive: true,
    limit: 10,
    offset: 0
  });
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newCompany, setNewCompany] = useState({
    name: '',
    description: '',
    website: '',
    city: ''
  });
  const [message, setMessage] = useState('');

  // Fetch companies
  const { 
    data: companiesResponse, 
    loading, 
    error,
    refetch 
  } = useApi(
    () => companiesAPI.getCompanies(filters.limit, filters.offset, filters.isActive),
    [filters.limit, filters.offset, filters.isActive]
  );

  const companies = companiesResponse?.companies || [];
  const total = companiesResponse?.total || 0;

  const handleCreateCompany = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newCompany.name.trim()) {
      setMessage('Company name is required');
      return;
    }

    try {
      await companiesAPI.createCompany(newCompany);
      setMessage('Company created successfully!');
      setNewCompany({ name: '', description: '', website: '', city: '' });
      setShowCreateForm(false);
      refetch();
      setTimeout(() => setMessage(''), 3000);
    } catch (err: any) {
      setMessage(err.message || 'Failed to create company');
    }
  };

  const handleDeleteCompany = async (id: number) => {
    if (confirm('Are you sure you want to delete this company?')) {
      try {
        await companiesAPI.deleteCompany(id);
        setMessage('Company deleted successfully');
        refetch();
        setTimeout(() => setMessage(''), 3000);
      } catch (err: any) {
        setMessage(err.message || 'Failed to delete company');
      }
    }
  };

  const isRecruiter = user?.role === 'recruiter' || user?.role === 'admin' || user?.role === 'tpo';

  return (
    <div className="container mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Companies</h1>
        {isRecruiter && (
          <Button onClick={() => setShowCreateForm(!showCreateForm)}>
            {showCreateForm ? 'Cancel' : '+ Add Company'}
          </Button>
        )}
      </div>

      {message && (
        <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded text-green-700 text-sm">
          {message}
        </div>
      )}

      {/* Create Company Form */}
      {showCreateForm && isRecruiter && (
        <Card className="p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Create New Company</h2>
          <form onSubmit={handleCreateCompany} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Company Name *</label>
              <Input
                value={newCompany.name}
                onChange={(e) => setNewCompany({...newCompany, name: e.target.value})}
                placeholder="Acme Corporation"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Description</label>
              <textarea
                value={newCompany.description}
                onChange={(e) => setNewCompany({...newCompany, description: e.target.value})}
                placeholder="Brief description of the company..."
                className="w-full p-2 border rounded text-sm"
                rows={3}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Website</label>
                <Input
                  type="url"
                  value={newCompany.website}
                  onChange={(e) => setNewCompany({...newCompany, website: e.target.value})}
                  placeholder="https://example.com"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">City</label>
                <Input
                  value={newCompany.city}
                  onChange={(e) => setNewCompany({...newCompany, city: e.target.value})}
                  placeholder="Bangalore"
                />
              </div>
            </div>

            <Button type="submit" className="w-full">Create Company</Button>
          </form>
        </Card>
      )}

      {/* Filters */}
      <Card className="p-4 mb-6">
        <div className="flex items-center gap-4">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={filters.isActive}
              onChange={(e) => setFilters({...filters, isActive: e.target.checked, offset: 0})}
              className="w-4 h-4"
            />
            <span className="text-sm">Active Companies Only</span>
          </label>
        </div>
      </Card>

      {/* Loading State */}
      {loading && <div className="text-center py-12 text-gray-600">Loading companies...</div>}

      {/* Error State */}
      {error && <div className="text-red-600 p-4 bg-red-50 rounded mb-4 text-sm">{error}</div>}

      {/* Companies List */}
      {!loading && companies.length === 0 && (
        <div className="text-center py-12 text-gray-600">No companies found</div>
      )}

      {!loading && companies.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {companies.map((company: any) => (
            <Card key={company.id} className="p-6 hover:shadow-lg transition">
              <h3 className="text-lg font-semibold mb-2">{company.name}</h3>
              {company.description && (
                <p className="text-gray-600 text-sm mb-3">{company.description}</p>
              )}
              
              <div className="space-y-1 mb-4 text-sm text-gray-700">
                {company.website && (
                  <p><span className="font-medium">Website:</span> {company.website}</p>
                )}
                {company.city && (
                  <p><span className="font-medium">City:</span> {company.city}</p>
                )}
              </div>

              <div className="flex gap-2">
                <Button variant="outline" size="sm" className="flex-1">
                  View Details
                </Button>
                {isRecruiter && (
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => handleDeleteCompany(company.id)}
                  >
                    Delete
                  </Button>
                )}
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Pagination */}
      {total > filters.limit && (
        <div className="flex justify-center gap-4 mt-8">
          <Button
            variant="outline"
            onClick={() => setFilters({...filters, offset: Math.max(0, filters.offset - filters.limit)})}
            disabled={filters.offset === 0}
          >
            ← Previous
          </Button>
          <div className="flex items-center px-4 py-2 text-sm">
            Page {Math.floor(filters.offset / filters.limit) + 1}
          </div>
          <Button
            variant="outline"
            onClick={() => setFilters({...filters, offset: filters.offset + filters.limit})}
            disabled={filters.offset + filters.limit >= total}
          >
            Next →
          </Button>
        </div>
      )}
    </div>
  );
}

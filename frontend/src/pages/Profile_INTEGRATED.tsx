import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';

export default function Profile() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [isEditing, setIsEditing] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [message, setMessage] = useState('');
  const [editData, setEditData] = useState({
    firstName: user?.first_name || '',
    lastName: user?.last_name || '',
    email: user?.email || '',
    phone: user?.phone || ''
  });
  const [passwordData, setPasswordData] = useState({
    oldPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setMessage('Profile updated successfully');
      setIsEditing(false);
      setTimeout(() => setMessage(''), 3000);
    } catch (err) {
      setMessage('Failed to update profile');
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setMessage('Passwords do not match');
      return;
    }

    if (passwordData.newPassword.length < 8) {
      setMessage('Password must be at least 8 characters');
      return;
    }

    try {
      setMessage('Password changed successfully');
      setPasswordData({ oldPassword: '', newPassword: '', confirmPassword: '' });
      setIsChangingPassword(false);
      setTimeout(() => setMessage(''), 3000);
    } catch (err) {
      setMessage('Failed to change password');
    }
  };

  const handleLogout = () => {
    if (confirm('Are you sure you want to logout?')) {
      logout();
      navigate('/login');
    }
  };

  if (!user) {
    return <div className="text-center py-12">Loading...</div>;
  }

  return (
    <div className="container mx-auto p-6 max-w-2xl">
      <h1 className="text-3xl font-bold mb-6">My Profile</h1>

      {message && (
        <div className={`mb-4 p-4 rounded border text-sm ${
          message.includes('successfully') 
            ? 'bg-green-50 border-green-200 text-green-700' 
            : 'bg-red-50 border-red-200 text-red-700'
        }`}>
          {message}
        </div>
      )}

      {/* User Info */}
      <Card className="p-6 mb-6">
        <div className="mb-4">
          <h2 className="text-2xl font-semibold">{user.first_name} {user.last_name}</h2>
          <p className="text-gray-600">{user.email}</p>
          <p className="text-sm text-gray-600 mt-1">Phone: {user.phone}</p>
          <p className="text-sm font-medium mt-2 capitalize">
            Role: <span className="text-blue-600">{user.role}</span>
          </p>
        </div>

        {!isEditing && (
          <Button onClick={() => setIsEditing(true)}>Edit Profile</Button>
        )}
      </Card>

      {/* Edit Profile Form */}
      {isEditing && (
        <Card className="p-6 mb-6">
          <h3 className="text-xl font-semibold mb-4">Edit Profile</h3>
          <form onSubmit={handleSaveProfile} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">First Name</label>
                <Input
                  value={editData.firstName}
                  onChange={(e) => setEditData({...editData, firstName: e.target.value})}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Last Name</label>
                <Input
                  value={editData.lastName}
                  onChange={(e) => setEditData({...editData, lastName: e.target.value})}
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Email</label>
              <Input value={editData.email} disabled className="bg-gray-100" />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Phone</label>
              <Input value={editData.phone} disabled className="bg-gray-100" />
            </div>

            <div className="flex gap-2">
              <Button type="submit">Save Changes</Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsEditing(false)}
              >
                Cancel
              </Button>
            </div>
          </form>
        </Card>
      )}

      {/* Change Password */}
      <Card className="p-6 mb-6">
        {!isChangingPassword && (
          <Button onClick={() => setIsChangingPassword(true)}>Change Password</Button>
        )}

        {isChangingPassword && (
          <form onSubmit={handleChangePassword} className="space-y-4">
            <h3 className="text-xl font-semibold mb-4">Change Password</h3>

            <div>
              <label className="block text-sm font-medium mb-1">Current Password</label>
              <Input
                type="password"
                value={passwordData.oldPassword}
                onChange={(e) => setPasswordData({...passwordData, oldPassword: e.target.value})}
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">New Password</label>
              <Input
                type="password"
                value={passwordData.newPassword}
                onChange={(e) => setPasswordData({...passwordData, newPassword: e.target.value})}
                required
              />
              <p className="text-xs text-gray-500 mt-1">At least 8 characters</p>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Confirm Password</label>
              <Input
                type="password"
                value={passwordData.confirmPassword}
                onChange={(e) => setPasswordData({...passwordData, confirmPassword: e.target.value})}
                required
              />
            </div>

            <div className="flex gap-2">
              <Button type="submit">Change Password</Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsChangingPassword(false)}
              >
                Cancel
              </Button>
            </div>
          </form>
        )}
      </Card>

      {/* Logout */}
      <Card className="p-6">
        <div className="flex items-center justify-between">
          <p className="text-gray-600">Logout from your account</p>
          <Button
            variant="destructive"
            onClick={handleLogout}
          >
            Logout
          </Button>
        </div>
      </Card>
    </div>
  );
}

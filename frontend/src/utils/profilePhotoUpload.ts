import client from '@/api/client';

/**
 * Upload profile photo to server
 * @param file - Image file to upload
 * @returns Promise with photoUrl and filename
 */
export const uploadProfilePhoto = async (file: File): Promise<{ photoUrl: string; filename: string }> => {
  if (!file) {
    throw new Error('No file provided');
  }

  // Validate file type
  const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png'];
  if (!allowedTypes.includes(file.type)) {
    throw new Error('Only JPG, JPEG, and PNG files are allowed');
  }

  // Validate file size (5MB max)
  const maxSize = 5 * 1024 * 1024;
  if (file.size > maxSize) {
    throw new Error('File size must be less than 5MB');
  }

  const formData = new FormData();
  formData.append('profilePhoto', file);

  try {
    const response = await client.post('/auth/upload-profile-photo', formData);

    return {
      photoUrl: response.data.photoUrl,
      filename: response.data.filename
    };
  } catch (error: any) {
    const errorMessage = error.response?.data?.message || error.message || 'Failed to upload profile photo';
    throw new Error(errorMessage);
  }
};

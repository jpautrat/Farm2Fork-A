'use client';

import { useState, useEffect } from 'react';
import { useUser } from '@supabase/auth-helpers-react';
import { useForm } from 'react-hook-form';
import axios from 'axios';
import Image from 'next/image';
import { toast } from 'react-hot-toast';
import { FaUser, FaSpinner, FaUpload } from 'react-icons/fa';

interface FarmerProfile {
  id: string;
  user_id: string;
  farm_name: string;
  description: string;
  location: string;
  profile_image: string;
  website: string;
  created_at: string;
  updated_at: string;
}

interface UserProfile {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  phone: string;
}

export default function FarmerProfile() {
  const user = useUser();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [farmerProfile, setFarmerProfile] = useState<FarmerProfile | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [uploadingImage, setUploadingImage] = useState(false);
  
  const { 
    register: registerFarmer, 
    handleSubmit: handleSubmitFarmer, 
    formState: { errors: farmerErrors },
    setValue: setFarmerValue
  } = useForm();
  
  const { 
    register: registerUser, 
    handleSubmit: handleSubmitUser, 
    formState: { errors: userErrors },
    setValue: setUserValue
  } = useForm();

  useEffect(() => {
    const fetchProfiles = async () => {
      if (!user) return;

      try {
        setLoading(true);
        
        // Fetch farmer profile
        const farmerResponse = await axios.get(
          `${process.env.NEXT_PUBLIC_API_URL}/users/farmer/profile`,
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem('access_token')}`,
            },
          }
        );
        
        const farmerData = farmerResponse.data.data;
        setFarmerProfile(farmerData);
        setImagePreview(farmerData.profile_image);
        
        // Set form values for farmer profile
        setFarmerValue('farm_name', farmerData.farm_name);
        setFarmerValue('description', farmerData.description);
        setFarmerValue('location', farmerData.location);
        setFarmerValue('website', farmerData.website);
        
        // Fetch user profile
        const userResponse = await axios.get(
          `${process.env.NEXT_PUBLIC_API_URL}/auth/me`,
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem('access_token')}`,
            },
          }
        );
        
        const userData = userResponse.data.data;
        setUserProfile(userData);
        
        // Set form values for user profile
        setUserValue('first_name', userData.first_name);
        setUserValue('last_name', userData.last_name);
        setUserValue('phone', userData.phone || '');
      } catch (error) {
        console.error('Error fetching profiles:', error);
        toast.error('Failed to load profile information');
      } finally {
        setLoading(false);
      }
    };

    fetchProfiles();
  }, [user, setFarmerValue, setUserValue]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const uploadImage = async () => {
    if (!imageFile) return null;
    
    setUploadingImage(true);
    
    try {
      // Create a FormData object to send the image
      const formData = new FormData();
      formData.append('image', imageFile);
      
      // Upload to Supabase Storage
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}/upload/image`,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
            Authorization: `Bearer ${localStorage.getItem('access_token')}`,
          },
        }
      );
      
      return response.data.url;
    } catch (error) {
      console.error('Error uploading image:', error);
      toast.error('Failed to upload profile image');
      return null;
    } finally {
      setUploadingImage(false);
    }
  };

  const onSubmitFarmerProfile = async (data: any) => {
    try {
      setSaving(true);
      
      // Upload image if a new one is selected
      let imageUrl = farmerProfile?.profile_image || '';
      if (imageFile) {
        const uploadedImageUrl = await uploadImage();
        if (uploadedImageUrl) {
          imageUrl = uploadedImageUrl;
        }
      }
      
      // Update farmer profile
      const response = await axios.put(
        `${process.env.NEXT_PUBLIC_API_URL}/users/farmer/profile`,
        {
          ...data,
          profile_image: imageUrl
        },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('access_token')}`,
          },
        }
      );
      
      setFarmerProfile(response.data.data);
      toast.success('Farm profile updated successfully');
    } catch (error) {
      console.error('Error updating farmer profile:', error);
      toast.error('Failed to update farm profile');
    } finally {
      setSaving(false);
    }
  };

  const onSubmitUserProfile = async (data: any) => {
    try {
      setSaving(true);
      
      // Update user profile
      const response = await axios.put(
        `${process.env.NEXT_PUBLIC_API_URL}/users/profile`,
        data,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('access_token')}`,
          },
        }
      );
      
      setUserProfile(response.data.data);
      toast.success('Personal information updated successfully');
    } catch (error) {
      console.error('Error updating user profile:', error);
      toast.error('Failed to update personal information');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <FaSpinner className="animate-spin text-primary-600 text-3xl" />
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Profile Management</h1>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Farm Profile */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-bold mb-4">Farm Information</h2>
          <form onSubmit={handleSubmitFarmer(onSubmitFarmerProfile)}>
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Farm Profile Image
              </label>
              <div className="flex items-center">
                <div className="mr-4">
                  {imagePreview ? (
                    <Image
                      src={imagePreview}
                      alt="Farm profile"
                      width={100}
                      height={100}
                      className="h-24 w-24 rounded-full object-cover"
                    />
                  ) : (
                    <div className="h-24 w-24 rounded-full bg-gray-200 flex items-center justify-center">
                      <FaUser className="text-gray-400 text-3xl" />
                    </div>
                  )}
                </div>
                <div>
                  <label
                    htmlFor="profile-image"
                    className="btn-outline flex items-center cursor-pointer"
                  >
                    <FaUpload className="mr-2" />
                    Upload Image
                    <input
                      id="profile-image"
                      type="file"
                      className="sr-only"
                      accept="image/*"
                      onChange={handleImageChange}
                    />
                  </label>
                  <p className="text-xs text-gray-500 mt-1">
                    Recommended: Square image, at least 300x300px
                  </p>
                </div>
              </div>
            </div>

            <div className="mb-4">
              <label htmlFor="farm_name" className="block text-sm font-medium text-gray-700 mb-1">
                Farm Name *
              </label>
              <input
                id="farm_name"
                type="text"
                className={`input-field ${farmerErrors.farm_name ? 'border-red-500' : ''}`}
                {...registerFarmer('farm_name', { required: 'Farm name is required' })}
              />
              {farmerErrors.farm_name && (
                <p className="mt-1 text-sm text-red-600">{farmerErrors.farm_name.message as string}</p>
              )}
            </div>

            <div className="mb-4">
              <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
                Farm Description
              </label>
              <textarea
                id="description"
                rows={4}
                className="input-field"
                placeholder="Tell customers about your farm, growing practices, etc."
                {...registerFarmer('description')}
              ></textarea>
            </div>

            <div className="mb-4">
              <label htmlFor="location" className="block text-sm font-medium text-gray-700 mb-1">
                Location *
              </label>
              <input
                id="location"
                type="text"
                className={`input-field ${farmerErrors.location ? 'border-red-500' : ''}`}
                placeholder="City, State"
                {...registerFarmer('location', { required: 'Location is required' })}
              />
              {farmerErrors.location && (
                <p className="mt-1 text-sm text-red-600">{farmerErrors.location.message as string}</p>
              )}
            </div>

            <div className="mb-4">
              <label htmlFor="website" className="block text-sm font-medium text-gray-700 mb-1">
                Website
              </label>
              <input
                id="website"
                type="url"
                className="input-field"
                placeholder="https://www.yourfarm.com"
                {...registerFarmer('website')}
              />
            </div>

            <div className="flex justify-end">
              <button
                type="submit"
                className="btn-primary flex items-center"
                disabled={saving || uploadingImage}
              >
                {(saving || uploadingImage) && <FaSpinner className="animate-spin mr-2" />}
                Save Farm Information
              </button>
            </div>
          </form>
        </div>

        {/* Personal Information */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-bold mb-4">Personal Information</h2>
          <form onSubmit={handleSubmitUser(onSubmitUserProfile)}>
            <div className="mb-4">
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                Email Address
              </label>
              <input
                id="email"
                type="email"
                className="input-field bg-gray-100"
                value={userProfile?.email || ''}
                disabled
              />
              <p className="text-xs text-gray-500 mt-1">
                Email cannot be changed. Contact support if you need to update your email.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <label htmlFor="first_name" className="block text-sm font-medium text-gray-700 mb-1">
                  First Name *
                </label>
                <input
                  id="first_name"
                  type="text"
                  className={`input-field ${userErrors.first_name ? 'border-red-500' : ''}`}
                  {...registerUser('first_name', { required: 'First name is required' })}
                />
                {userErrors.first_name && (
                  <p className="mt-1 text-sm text-red-600">{userErrors.first_name.message as string}</p>
                )}
              </div>
              <div>
                <label htmlFor="last_name" className="block text-sm font-medium text-gray-700 mb-1">
                  Last Name *
                </label>
                <input
                  id="last_name"
                  type="text"
                  className={`input-field ${userErrors.last_name ? 'border-red-500' : ''}`}
                  {...registerUser('last_name', { required: 'Last name is required' })}
                />
                {userErrors.last_name && (
                  <p className="mt-1 text-sm text-red-600">{userErrors.last_name.message as string}</p>
                )}
              </div>
            </div>

            <div className="mb-4">
              <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
                Phone Number
              </label>
              <input
                id="phone"
                type="tel"
                className="input-field"
                placeholder="(123) 456-7890"
                {...registerUser('phone')}
              />
            </div>

            <div className="flex justify-end">
              <button
                type="submit"
                className="btn-primary flex items-center"
                disabled={saving}
              >
                {saving && <FaSpinner className="animate-spin mr-2" />}
                Save Personal Information
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

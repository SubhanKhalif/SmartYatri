import { useState, useEffect, useRef } from 'react';
import Sidebar from '../../components/Sidebar';
import { profileService } from '../../services/profileService';
import QRDisplay from '../../components/QRDisplay';

const SERVER_URL = import.meta.env.VITE_SERVER_URL || 'http://localhost:5000';

export default function Profile() {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editing, setEditing] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');
  const fileInputRef = useRef(null);
  const [formData, setFormData] = useState({
    fullName: '',
    schoolName: '',
    idNumber: '',
    classOrPosition: '',
    email: '',
    phone: '',
    address: '',
    emergencyContact: '',
    emergencyPhone: '',
    photo: '',
    photoFile: null,
  });

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      setLoading(true);
      const res = await profileService.getProfile();
      setProfile(res.profile);
      if (res.profile) {
        setFormData({
          fullName: res.profile.fullName || '',
          schoolName: res.profile.schoolName || '',
          idNumber: res.profile.idNumber || '',
          classOrPosition: res.profile.classOrPosition || '',
          email: res.profile.email || '',
          phone: res.profile.phone || '',
          address: res.profile.address || '',
          emergencyContact: res.profile.emergencyContact || '',
          emergencyPhone: res.profile.emergencyPhone || '',
          photo: res.profile.photo || '',
          photoFile: null,
        });
      }
    } catch (err) {
      console.error('Error loading profile:', err);
      setError('Failed to load profile');
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setError('File size must be less than 5MB');
        return;
      }
      if (!file.type.startsWith('image/')) {
        setError('Please select an image file');
        return;
      }
      setFormData({ ...formData, photoFile: file });
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData(prev => ({ ...prev, photo: reader.result }));
      };
      reader.readAsDataURL(file);
    }
  };

  const uploadPhoto = async (file) => {
    const formData = new FormData();
    formData.append('photo', file);
    
    const res = await fetch(`${SERVER_URL}/api/profile/upload-photo`, {
      method: 'POST',
      credentials: 'include',
      body: formData,
    });
    const data = await res.json();
    if (!data.success) throw new Error(data.error);
    return data.photoUrl;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    setSuccess('');
    
    try {
      let photoUrl = formData.photo;
      
      // Upload photo if a new file was selected
      if (formData.photoFile) {
        photoUrl = await uploadPhoto(formData.photoFile);
      }

      const updateData = {
        fullName: formData.fullName,
        schoolName: formData.schoolName,
        idNumber: formData.idNumber,
        classOrPosition: formData.classOrPosition,
        email: formData.email,
        phone: formData.phone,
        address: formData.address,
        emergencyContact: formData.emergencyContact,
        emergencyPhone: formData.emergencyPhone,
        photo: photoUrl,
      };

      await profileService.updateProfile(updateData);
      await loadProfile();
      setEditing(false);
      setSuccess('Profile updated successfully!');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.message || 'Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-indigo-50/30 to-gray-50 flex">
        <Sidebar role="faculty" />
        <div className="flex-1 p-6 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading profile...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-indigo-50/30 to-gray-50 flex">
      <Sidebar role="faculty" />
      <div className="flex-1 p-4 md:p-6 lg:p-8 overflow-y-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-indigo-700 to-purple-600 bg-clip-text text-transparent mb-2">
            My Profile
          </h1>
          <p className="text-gray-600">Manage your personal information and settings</p>
        </div>

        {/* Success/Error Messages */}
        {success && (
          <div className="mb-6 p-4 bg-green-100 border-l-4 border-green-500 text-green-700 rounded-lg animate-fade-in">
            <div className="flex items-center gap-2">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              {success}
            </div>
          </div>
        )}
        {error && (
          <div className="mb-6 p-4 bg-red-100 border-l-4 border-red-500 text-red-700 rounded-lg animate-fade-in">
            <div className="flex items-center gap-2">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              {error}
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Profile Photo & Basic Info */}
          <div className="lg:col-span-1">
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-gray-200/50 p-6 sticky top-6">
              <div className="text-center">
                {/* Photo Upload */}
                <div className="relative inline-block mb-4">
                  <div className="relative">
                    <img
                      src={formData.photo || '/default-avatar.png'}
                      alt="Profile"
                      className="w-32 h-32 rounded-full object-cover border-4 border-indigo-200 shadow-lg mx-auto"
                      onError={(e) => {
                        e.target.src = 'https://ui-avatars.com/api/?name=' + encodeURIComponent(formData.fullName || 'User') + '&background=6366f1&color=fff&size=128';
                      }}
                    />
                    {editing && (
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="absolute bottom-0 right-0 p-2 bg-indigo-600 text-white rounded-full shadow-lg hover:bg-indigo-700 transition transform hover:scale-110"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                      </button>
                    )}
                  </div>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    className="hidden"
                  />
                </div>
                <h2 className="text-2xl font-bold text-gray-800 mb-1">{profile?.fullName || 'Not set'}</h2>
                <p className="text-gray-600 mb-4">{profile?.classOrPosition || 'Staff'}</p>
                
                {!editing && (
                  <button
                    onClick={() => setEditing(true)}
                    className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-6 py-3 rounded-xl hover:from-indigo-700 hover:to-purple-700 transition-all duration-200 shadow-lg font-semibold"
                  >
                    <span className="flex items-center justify-center gap-2">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                      Edit Profile
                    </span>
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Profile Information Form */}
          <div className="lg:col-span-2">
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-gray-200/50 p-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-lg">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </div>
                <h2 className="text-2xl font-bold text-gray-800">Profile Information</h2>
              </div>

              {editing ? (
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Full Name <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        value={formData.fullName}
                        onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                        className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition outline-none"
                        placeholder="Enter your full name"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">School/Organization</label>
                      <input
                        type="text"
                        value={formData.schoolName}
                        onChange={(e) => setFormData({ ...formData, schoolName: e.target.value })}
                        className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition outline-none"
                        placeholder="Enter school/organization name"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Staff ID</label>
                      <input
                        type="text"
                        value={formData.idNumber}
                        onChange={(e) => setFormData({ ...formData, idNumber: e.target.value })}
                        className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition outline-none"
                        placeholder="Enter staff ID"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Position/Department</label>
                      <input
                        type="text"
                        value={formData.classOrPosition}
                        onChange={(e) => setFormData({ ...formData, classOrPosition: e.target.value })}
                        className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition outline-none"
                        placeholder="e.g., Teacher, Admin, etc."
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Email</label>
                      <input
                        type="email"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition outline-none"
                        placeholder="your.email@example.com"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Phone</label>
                      <input
                        type="tel"
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition outline-none"
                        placeholder="+1234567890"
                      />
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Address</label>
                    <textarea
                      value={formData.address}
                      onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                      rows={3}
                      className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition outline-none resize-none"
                      placeholder="Enter your address"
                    />
                  </div>

                  <div className="border-t pt-4">
                    <h3 className="text-lg font-semibold text-gray-800 mb-4">Emergency Contact</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">Contact Name</label>
                        <input
                          type="text"
                          value={formData.emergencyContact}
                          onChange={(e) => setFormData({ ...formData, emergencyContact: e.target.value })}
                          className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition outline-none"
                          placeholder="Emergency contact name"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">Contact Phone</label>
                        <input
                          type="tel"
                          value={formData.emergencyPhone}
                          onChange={(e) => setFormData({ ...formData, emergencyPhone: e.target.value })}
                          className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition outline-none"
                          placeholder="+1234567890"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-3 pt-4">
                    <button
                      type="submit"
                      disabled={saving}
                      className="flex-1 bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-6 py-3 rounded-xl hover:from-indigo-700 hover:to-purple-700 transition-all duration-200 shadow-lg font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {saving ? (
                        <span className="flex items-center justify-center gap-2">
                          <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"></path>
                          </svg>
                          Saving...
                        </span>
                      ) : (
                        'Save Changes'
                      )}
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setEditing(false);
                        loadProfile();
                        setError('');
                      }}
                      className="px-6 py-3 bg-gray-200 text-gray-700 rounded-xl hover:bg-gray-300 transition font-semibold"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              ) : (
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="p-4 bg-gradient-to-r from-indigo-50 to-purple-50 rounded-xl">
                      <p className="text-sm text-gray-600 mb-1">Full Name</p>
                      <p className="font-bold text-gray-800 text-lg">{profile?.fullName || 'Not set'}</p>
                    </div>
                    <div className="p-4 bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl">
                      <p className="text-sm text-gray-600 mb-1">School/Organization</p>
                      <p className="font-bold text-gray-800 text-lg">{profile?.schoolName || 'Not set'}</p>
                    </div>
                    <div className="p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl">
                      <p className="text-sm text-gray-600 mb-1">Staff ID</p>
                      <p className="font-bold text-gray-800 text-lg">{profile?.idNumber || 'Not set'}</p>
                    </div>
                    <div className="p-4 bg-gradient-to-r from-orange-50 to-red-50 rounded-xl">
                      <p className="text-sm text-gray-600 mb-1">Position/Department</p>
                      <p className="font-bold text-gray-800 text-lg">{profile?.classOrPosition || 'Not set'}</p>
                    </div>
                    {profile?.email && (
                      <div className="p-4 bg-gradient-to-r from-blue-50 to-cyan-50 rounded-xl">
                        <p className="text-sm text-gray-600 mb-1">Email</p>
                        <p className="font-bold text-gray-800 text-lg">{profile.email}</p>
                      </div>
                    )}
                    {profile?.phone && (
                      <div className="p-4 bg-gradient-to-r from-teal-50 to-cyan-50 rounded-xl">
                        <p className="text-sm text-gray-600 mb-1">Phone</p>
                        <p className="font-bold text-gray-800 text-lg">{profile.phone}</p>
                      </div>
                    )}
                  </div>
                  
                  {profile?.address && (
                    <div className="p-4 bg-gray-50 rounded-xl">
                      <p className="text-sm text-gray-600 mb-1">Address</p>
                      <p className="font-semibold text-gray-800">{profile.address}</p>
                    </div>
                  )}

                  {(profile?.emergencyContact || profile?.emergencyPhone) && (
                    <div className="p-4 bg-red-50 border-l-4 border-red-500 rounded-xl">
                      <p className="text-sm font-semibold text-gray-700 mb-2">Emergency Contact</p>
                      {profile.emergencyContact && (
                        <p className="text-gray-800 mb-1"><span className="font-semibold">Name:</span> {profile.emergencyContact}</p>
                      )}
                      {profile.emergencyPhone && (
                        <p className="text-gray-800"><span className="font-semibold">Phone:</span> {profile.emergencyPhone}</p>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* QR Code Section */}
            {profile?.qrId && (
              <div className="mt-6 bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-gray-200/50 p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 bg-gradient-to-br from-green-500 to-emerald-500 rounded-lg">
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" />
                    </svg>
                  </div>
                  <h2 className="text-2xl font-bold text-gray-800">My QR Code</h2>
                </div>
                <QRDisplay
                  qrId={profile.qrId}
                  qrCode={null}
                  status="ACTIVE"
                  profile={profile}
                />
              </div>
            )}
          </div>
        </div>
      </div>
      <style>{`
        @keyframes fade-in {
          from { opacity: 0; transform: translateY(-10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in {
          animation: fade-in 0.3s ease-out;
        }
      `}</style>
    </div>
  );
}


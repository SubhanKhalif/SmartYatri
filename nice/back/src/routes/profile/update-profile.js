import express from 'express';
import multer from 'multer';
import prisma from '../../lib/prisma.js';
import { validateSession } from '../../lib/auth.js';
import { uploadPhoto, getFileUrl } from '../../utils/multer.js';

const router = express.Router();

/**
 * Upload photo (accepts multipart/form-data with 'photo' field)
 * POST /api/profile/upload-photo
 */
router.post('/upload-photo', (req, res, next) => {
  uploadPhoto(req, res, (err) => {
    if (err) {
      // Handle multer errors
      if (err instanceof multer.MulterError) {
        if (err.code === 'LIMIT_FILE_SIZE') {
          return res.status(400).json({
            success: false,
            error: 'File size too large. Maximum size is 5MB',
          });
        }
        return res.status(400).json({
          success: false,
          error: err.message,
        });
      }
      // Handle other errors (e.g., file filter errors)
      return res.status(400).json({
        success: false,
        error: err.message || 'File upload error',
      });
    }
    next();
  });
}, async (req, res) => {
  try {
    const { user } = await validateSession(req);

    if (!req.file) {
      return res.status(400).json({
        success: false,
        error: 'Photo file is required',
      });
    }

    // Get the file URL
    const photoUrl = getFileUrl(req.file.filename);

    // Update profile with photo
    let profile = await prisma.userProfile.findUnique({
      where: { userId: user.id },
    });

    if (profile) {
      profile = await prisma.userProfile.update({
        where: { userId: user.id },
        data: { photo: photoUrl },
      });
    } else {
      // Create profile if doesn't exist
      profile = await prisma.userProfile.create({
        data: {
          userId: user.id,
          fullName: user.username || 'User',
          roleType: user.loginType || 'STUDENT',
          photo: photoUrl,
        },
      });
    }

    return res.json({
      success: true,
      photoUrl: profile.photo,
    });
  } catch (err) {
    console.error('Error uploading photo:', err);
    return res.status(err.status || 500).json({
      success: false,
      error: err.message || 'Failed to upload photo',
    });
  }
});

/**
 * Update user profile
 * PATCH /api/profile/update
 */
router.patch('/update', async (req, res) => {
  try {
    const { user } = await validateSession(req);
    const { 
      fullName, 
      schoolName, 
      idNumber, 
      classOrPosition, 
      photo,
      email,
      // phone, address, emergencyContact, emergencyPhone - reserved for future schema update
    } = req.body;

    // Get or create profile
    let profile = await prisma.userProfile.findUnique({
      where: { userId: user.id },
    });

    const updateData = {};
    if (fullName) updateData.fullName = fullName;
    if (schoolName !== undefined) updateData.schoolName = schoolName;
    if (idNumber !== undefined) updateData.idNumber = idNumber;
    if (classOrPosition !== undefined) updateData.classOrPosition = classOrPosition;
    if (photo !== undefined) updateData.photo = photo;

    // Update user email if provided
    if (email !== undefined) {
      await prisma.userLogin.update({
        where: { id: user.id },
        data: { email },
      });
    }

    // Note: phone, address, emergencyContact, emergencyPhone are not in the schema yet
    // These would need to be added to UserProfile model or stored separately
    // For now, we'll just update what's available

    if (profile) {
      profile = await prisma.userProfile.update({
        where: { userId: user.id },
        data: updateData,
      });
    } else {
      // Create profile if doesn't exist
      profile = await prisma.userProfile.create({
        data: {
          userId: user.id,
          fullName: fullName || user.username,
          schoolName: schoolName || null,
          roleType: user.loginType || 'STUDENT',
          idNumber: idNumber || null,
          classOrPosition: classOrPosition || null,
          photo: photo || null,
        },
      });
    }

    // Get updated user with email
    const updatedUser = await prisma.userLogin.findUnique({
      where: { id: user.id },
      select: { email: true },
    });

    return res.json({
      success: true,
      profile: {
        id: profile.id,
        fullName: profile.fullName,
        schoolName: profile.schoolName,
        roleType: profile.roleType,
        idNumber: profile.idNumber,
        classOrPosition: profile.classOrPosition,
        photo: profile.photo,
        qrId: profile.qrId,
        email: updatedUser?.email || null,
        // Note: These fields would need schema update
        phone: null,
        address: null,
        emergencyContact: null,
        emergencyPhone: null,
      },
    });
  } catch (err) {
    console.error('Error updating profile:', err);
    return res.status(err.status || 500).json({
      success: false,
      error: err.message || 'Failed to update profile',
    });
  }
});

/**
 * Get user profile
 * GET /api/profile
 */
router.get('/', async (req, res) => {
  try {
    const { user } = await validateSession(req);

    let profile = await prisma.userProfile.findUnique({
      where: { userId: user.id },
    });

    if (!profile) {
      return res.json({
        success: true,
        profile: null,
      });
    }

    // Get user email
    const userData = await prisma.userLogin.findUnique({
      where: { id: user.id },
      select: { email: true },
    });

    return res.json({
      success: true,
      profile: {
        id: profile.id,
        fullName: profile.fullName,
        schoolName: profile.schoolName,
        roleType: profile.roleType,
        idNumber: profile.idNumber,
        classOrPosition: profile.classOrPosition,
        photo: profile.photo,
        qrId: profile.qrId,
        email: userData?.email || null,
        // Note: These fields would need schema update
        phone: null,
        address: null,
        emergencyContact: null,
        emergencyPhone: null,
        createdAt: profile.createdAt,
        updatedAt: profile.updatedAt,
      },
    });
  } catch (err) {
    console.error('Error getting profile:', err);
    return res.status(err.status || 500).json({
      success: false,
      error: err.message || 'Failed to get profile',
    });
  }
});

export default router;


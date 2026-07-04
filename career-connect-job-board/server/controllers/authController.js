import { validationResult } from 'express-validator';
import crypto from 'crypto';
import User from '../models/User.js';
import Company from '../models/Company.js';
import generateToken from '../utils/generateToken.js';
import { uploadFile, deleteFile } from '../utils/uploader.js';
import { sendEmail, getVerificationEmailBody } from '../utils/sendEmail.js';

// @desc    Register user
// @route   POST /api/auth/register
// @access  Public
export const registerUser = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    const { name, email, password, role } = req.body;

    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ success: false, message: 'User already exists' });
    }

    // Generate email verification token
    const verificationToken = crypto.randomBytes(20).toString('hex');

    const user = await User.create({
      name,
      email,
      password,
      role: role || 'candidate',
      verificationToken,
      isVerified: false, // Enforce email verification
    });

    if (user) {
      // Send verification email
      await sendEmail({
        to: email,
        subject: 'Verify Your Email Address - CareerConnect',
        htmlBody: getVerificationEmailBody(name, verificationToken),
      });

      res.status(201).json({
        success: true,
        message: 'Registration successful. Please verify your email.',
        data: {
          _id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          isVerified: user.isVerified,
          verificationToken, // Return for simulation
        },
      });
    } else {
      res.status(400).json({ success: false, message: 'Invalid user data' });
    }
  } catch (error) {
    next(error);
  }
};

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
export const loginUser = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    const { email, password } = req.body;

    const user = await User.findOne({ email }).select('+password').populate('company');
    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid email or password' });
    }

    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid email or password' });
    }

    res.json({
      success: true,
      data: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        isVerified: user.isVerified,
        avatar: user.avatar,
        title: user.title,
        bio: user.bio,
        skills: user.skills,
        education: user.education,
        experience: user.experience,
        resumeUrl: user.resumeUrl,
        company: user.company,
        token: generateToken(user._id),
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Verify email token
// @route   GET /api/auth/verify/:token
// @access  Public
export const verifyEmail = async (req, res, next) => {
  try {
    const user = await User.findOne({ verificationToken: req.params.token });
    if (!user) {
      return res.status(400).json({ success: false, message: 'Invalid verification token' });
    }

    user.isVerified = true;
    user.verificationToken = undefined;
    await user.save();

    res.json({
      success: true,
      message: 'Email verified successfully! You can now log in.',
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Forgot password
// @route   POST /api/auth/forgot-password
// @access  Public
export const forgotPassword = async (req, res, next) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ success: false, message: 'No user registered with this email' });
    }

    // Generate reset token
    const resetToken = crypto.randomBytes(20).toString('hex');
    user.resetPasswordToken = resetToken;
    user.resetPasswordExpire = Date.now() + 10 * 60 * 1000; // 10 minutes expire
    await user.save();

    console.log(`Password reset token for ${email}: ${resetToken}`);

    res.json({
      success: true,
      message: 'Password reset link simulated. Use token to reset.',
      resetToken, // Returned for testing convenience
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Reset password
// @route   PUT /api/auth/reset-password/:token
// @access  Public
export const resetPassword = async (req, res, next) => {
  try {
    const { password } = req.body;

    const user = await User.findOne({
      resetPasswordToken: req.params.token,
      resetPasswordExpire: { $gt: Date.now() },
    });

    if (!user) {
      return res.status(400).json({ success: false, message: 'Invalid or expired password reset token' });
    }

    user.password = password;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;
    await user.save();

    res.json({
      success: true,
      message: 'Password reset successful! You can now log in.',
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get current user profile
// @route   GET /api/auth/me
// @access  Private
export const getMe = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id).populate('company');
    res.json({ success: true, data: user });
  } catch (error) {
    next(error);
  }
};

// @desc    Update user profile & upload files
// @route   PUT /api/auth/profile
// @access  Private
export const updateProfile = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    const { name, bio, title, skills, education, experience } = req.body;

    user.name = name || user.name;
    user.bio = bio !== undefined ? bio : user.bio;
    user.title = title !== undefined ? title : user.title;
    
    if (skills) {
      user.skills = Array.isArray(skills) ? skills : JSON.parse(skills);
    }
    if (education) {
      user.education = Array.isArray(education) ? education : JSON.parse(education);
    }
    if (experience) {
      user.experience = Array.isArray(experience) ? experience : JSON.parse(experience);
    }

    // Handles avatar upload (if uploaded as single 'avatar' field)
    if (req.files && req.files.avatar) {
      // Delete old avatar if exists
      if (user.avatarPublicId) {
        await deleteFile(user.avatarPublicId);
      }
      const avatarRes = await uploadFile(req.files.avatar[0], 'career_connect/avatars');
      user.avatar = avatarRes.url;
      user.avatarPublicId = avatarRes.publicId;
    }

    // Handles resume upload (if uploaded as single 'resume' field)
    if (req.files && req.files.resume) {
      // Delete old resume if exists
      if (user.resumePublicId) {
        await deleteFile(user.resumePublicId);
      }
      const resumeRes = await uploadFile(req.files.resume[0], 'career_connect/resumes');
      user.resumeUrl = resumeRes.url;
      user.resumePublicId = resumeRes.publicId;
    }

    const updatedUser = await user.save();
    const populatedUser = await User.findById(updatedUser._id).populate('company');

    res.json({
      success: true,
      message: 'Profile updated successfully',
      data: populatedUser,
    });
  } catch (error) {
    next(error);
  }
};

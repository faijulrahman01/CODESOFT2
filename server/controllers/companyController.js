import { validationResult } from 'express-validator';
import Company from '../models/Company.js';
import User from '../models/User.js';
import { uploadFile } from '../utils/uploader.js';

// @desc    Register a new company profile
// @route   POST /api/companies
// @access  Private (Employer/Admin)
export const createCompany = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    // Check if creator already registered a company
    const existingCompany = await Company.findOne({ creator: req.user.id });
    if (existingCompany) {
      return res.status(400).json({ 
        success: false, 
        message: 'A company profile is already registered under this user account.' 
      });
    }

    const { name, website, location, sector, employeesCount, description } = req.body;

    let logoUrl = '';
    let logoPublicId = '';

    if (req.file) {
      const uploadRes = await uploadFile(req.file, 'career_connect/companies');
      logoUrl = uploadRes.url;
      logoPublicId = uploadRes.publicId;
    }

    const company = new Company({
      name,
      website,
      location,
      sector,
      employeesCount: Number(employeesCount) || 0,
      description,
      logo: logoUrl,
      logoPublicId,
      creator: req.user.id,
    });

    const savedCompany = await company.save();

    // Associate company ID back to User
    await User.findByIdAndUpdate(req.user.id, { company: savedCompany._id });

    res.status(201).json({
      success: true,
      message: 'Company profile registered successfully!',
      data: savedCompany,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update an existing company profile
// @route   PUT /api/companies/:id
// @access  Private (Creator/Admin)
export const updateCompany = async (req, res, next) => {
  try {
    let company = await Company.findById(req.params.id);
    if (!company) {
      return res.status(404).json({ success: false, message: 'Company profile not found' });
    }

    // Enforce ownership checks
    if (company.creator.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(401).json({ success: false, message: 'User not authorized to update this company' });
    }

    const { name, website, location, sector, employeesCount, description } = req.body;

    company.name = name || company.name;
    company.website = website || company.website;
    company.location = location || company.location;
    company.sector = sector || company.sector;
    company.employeesCount = employeesCount !== undefined ? Number(employeesCount) : company.employeesCount;
    company.description = description || company.description;

    if (req.file) {
      const uploadRes = await uploadFile(req.file, 'career_connect/companies');
      company.logo = uploadRes.url;
      company.logoPublicId = uploadRes.publicId;
    }

    const updatedCompany = await company.save();

    res.json({
      success: true,
      message: 'Company profile updated successfully!',
      data: updatedCompany,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get company details by ID
// @route   GET /api/companies/:id
// @access  Public
export const getCompanyById = async (req, res, next) => {
  try {
    const company = await Company.findById(req.params.id).populate('creator', 'name email');
    if (!company) {
      return res.status(404).json({ success: false, message: 'Company profile not found' });
    }

    res.json({ success: true, data: company });
  } catch (error) {
    next(error);
  }
};

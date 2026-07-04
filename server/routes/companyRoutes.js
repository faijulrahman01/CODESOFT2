import express from 'express';
import { body } from 'express-validator';
import {
  createCompany,
  updateCompany,
  getCompanyById,
} from '../controllers/companyController.js';
import { protect, authorize } from '../middleware/authMiddleware.js';
import { upload } from '../middleware/multerMiddleware.js';

const router = express.Router();

const companyValidation = [
  body('name', 'Company name is required').notEmpty(),
];

// Public details check
router.get('/:id', getCompanyById);

// Protected corporate registrations
router.post(
  '/',
  protect,
  authorize('employer', 'admin'),
  upload.single('logo'),
  companyValidation,
  createCompany
);

router.put(
  '/:id',
  protect,
  authorize('employer', 'admin'),
  upload.single('logo'),
  updateCompany
);

export default router;

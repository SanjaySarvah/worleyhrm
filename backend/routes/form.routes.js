const express = require('express');
const router = express.Router();
const upload = require('../middleware/upload');
const Form = require('../models/Form'); 

const {
  createForm,
  getForm,
  deleteForm,
  updatePersonalDetails,
  updateContactDetails,
  updateWorkingDetails,
  addExperience,
  updateExperience,
  deleteExperience,
  updateBankDetails,
  uploadProfileImage,
  getProfileImage,
} = require('../controllers/form.controller');

// ============================
// CONFIG
// ============================
const MAX_EXPERIENCES = 5; // 👈 change this if you want a different cap

// ============================
// MIDDLEWARES (local to this router)
// ============================

// Ensure the form exists (reuseful)
const ensureFormExists = async (req, res, next) => {
  try {
    const { formId } = req.params;
    const form = await Form.findOne({ formId });
    if (!form) return res.status(404).json({ message: 'Form not found' });
    req.formDoc = form; // attach for later middlewares/handlers if needed
    next();
  } catch (err) {
    next(err);
  }
};

// Limit experiences count
const limitExperiences = (max) => async (req, res, next) => {
  try {
    const form = req.formDoc || await Form.findOne({ formId: req.params.formId });
    if (!form) return res.status(404).json({ message: 'Form not found' });

    const current = (form.workingDetails?.experiences || []).length;
    if (current >= max) {
      return res.status(400).json({
        message: `Maximum ${max} experiences allowed. You already have ${current}.`
      });
    }

    next();
  } catch (err) {
    next(err);
  }
};

// Validate experience payload (basic required fields + dates)
const validateExperiencePayload = (req, res, next) => {
  const { company, designation, from, to } = req.body;

  const missing = [];
  if (!company) missing.push('company');
  if (!designation) missing.push('designation');
  if (!from) missing.push('from');
  if (!to) missing.push('to');

  if (missing.length) {
    return res.status(400).json({
      message: `Missing required fields: ${missing.join(', ')}`
    });
  }

  const fromDate = new Date(from);
  const toDate = new Date(to);
  if (isNaN(fromDate) || isNaN(toDate)) {
    return res.status(400).json({ message: '`from` and `to` must be valid dates (YYYY-MM-DD)' });
  }
  if (fromDate >= toDate) {
    return res.status(400).json({ message: '`from` must be earlier than `to`' });
  }

  next();
};

// ============================
// ROUTES
// ============================

// Create empty form (only formId)
router.post('/', createForm);

// Get / Delete full form
router.get('/:formId', getForm);
router.delete('/:formId', deleteForm);

/**
 * PERSONAL DETAILS
 * Files accepted:
 *  - profileImage
 *  - aadhaarCard
 *  - panCard
 *  - passport
 */
router.patch(
  '/:formId/personal',
  upload.fields([
    { name: 'profileImage', maxCount: 1 },
    { name: 'aadhaarCard', maxCount: 1 },
    { name: 'panCard', maxCount: 1 },
    { name: 'passport', maxCount: 1 },
  ]),
  updatePersonalDetails
);

/**
 * CONTACT DETAILS (no files)
 */
router.patch('/:formId/contact', updateContactDetails);

/**
 * WORKING DETAILS (pf/esi)
 */
router.patch('/:formId/working', updateWorkingDetails);

/**
 * EXPERIENCES
 * Add (POST), Update (PUT), Delete (DELETE)
 */
router.post(
  '/:formId/working/experiences',
  ensureFormExists,
  limitExperiences(MAX_EXPERIENCES),
  upload.fields([
    { name: 'experienceLetter', maxCount: 1 },
    { name: 'relievingLetter', maxCount: 1 },
    { name: 'payslip', maxCount: 1 },
  ]),
  validateExperiencePayload,
  addExperience
);

router.put(
  '/:formId/working/experiences/:expId',
  upload.fields([
    { name: 'experienceLetter', maxCount: 1 },
    { name: 'relievingLetter', maxCount: 1 },
    { name: 'payslip', maxCount: 1 },
  ]),
  validateExperiencePayload, // You can make this lighter if you want partial updates
  updateExperience
);

router.delete('/:formId/working/experiences/:expId', deleteExperience);

/**
 * BANK DETAILS
 * Files accepted:
 *  - bankPassbook
 */
router.patch(
  '/:formId/bank',
  upload.single('bankPassbook'),
  updateBankDetails
);

router.patch(
  '/profile-image/:formId',
  upload.fields([{ name: 'profileImage', maxCount: 1 }]),
  uploadProfileImage
);

// Get profile image
router.get('/profile-image/:formId', getProfileImage);

module.exports = router;

// controllers/form.controller.js
const Form = require('../models/Form');
const asyncHandler = require('../utils/asyncHandler');
const toRelativeUploadPath = require('../utils/filePath');

// Helper: Get Form by formId
const findByFormId = async (formId) => {
  const doc = await Form.findOne({ formId });
  if (!doc) throw new Error('Form not found');
  return doc;
};

// Create empty form shell
exports.createForm = asyncHandler(async (req, res) => {
  const { formId } = req.body;
  if (!formId) return res.status(400).json({ message: 'formId is required' });

  const existing = await Form.findOne({ formId });
  if (existing) return res.status(409).json({ message: 'formId already exists' });

  const form = await Form.create({ formId });
  res.status(201).json({ message: 'Form created', data: form });
});

// Get full form
exports.getForm = asyncHandler(async (req, res) => {
  const { formId } = req.params;
  const form = await findByFormId(formId);
  res.json({ data: form });
});

// Delete form
exports.deleteForm = asyncHandler(async (req, res) => {
  const { formId } = req.params;
  await Form.findOneAndDelete({ formId });
  res.json({ message: 'Form deleted (if existed)' });
});

// Update personalDetails with file uploads
exports.updatePersonalDetails = asyncHandler(async (req, res) => {
  const { formId } = req.params;
  const files = req.files || {};
  const body = { ...req.body };

  if (files.profileImage?.[0]) body.profileImage = toRelativeUploadPath(files.profileImage[0].path);
  if (files.aadhaarCard?.[0]) body.aadhaarCard = toRelativeUploadPath(files.aadhaarCard[0].path);
  if (files.panCard?.[0]) body.panCard = toRelativeUploadPath(files.panCard[0].path);
  if (files.passport?.[0]) body.passport = toRelativeUploadPath(files.passport[0].path);

  const form = await Form.findOneAndUpdate(
    { formId },
    { $set: { personalDetails: body } },
    { new: true, runValidators: true }
  );

  if (!form) return res.status(404).json({ message: 'Form not found' });
  res.json({ message: 'personalDetails updated', data: form.personalDetails });
});

// Update contactDetails
exports.updateContactDetails = asyncHandler(async (req, res) => {
  const { formId } = req.params;
  const form = await Form.findOneAndUpdate(
    { formId },
    { $set: { contactDetails: req.body } },
    { new: true, runValidators: true }
  );
  if (!form) return res.status(404).json({ message: 'Form not found' });
  res.json({ message: 'contactDetails updated', data: form.contactDetails });
});

// Update pf and esi numbers
exports.updateWorkingDetails = asyncHandler(async (req, res) => {
  const { formId } = req.params;
  const { pfNumber, esiNumber } = req.body;

  const form = await Form.findOneAndUpdate(
    { formId },
    {
      $set: {
        'workingDetails.pfNumber': pfNumber,
        'workingDetails.esiNumber': esiNumber
      }
    },
    { new: true, runValidators: true }
  );

  if (!form) return res.status(404).json({ message: 'Form not found' });
  res.json({ message: 'workingDetails updated', data: form.workingDetails });
});

// ADD experience (incremental uploads)

exports.addExperience = asyncHandler(async (req, res) => {
  const { formId } = req.params;
  const form = await findByFormId(formId);

  const current = form.workingDetails.experiences.length;
  if (current >= 5) {
    return res.status(400).json({ message: 'Maximum of 5 experiences allowed' });
  }

  const files = req.files || {};
  const exp = { ...req.body };

  // ✅ Parse and validate dates
  const fromDate = new Date(exp.from);
  const toDate = new Date(exp.to);

  if (isNaN(fromDate.getTime()) || isNaN(toDate.getTime())) {
    return res.status(400).json({ message: '`from` and `to` must be valid dates (YYYY-MM-DD)' });
  }

  exp.from = fromDate.toISOString().split('T')[0]; // force proper format
  exp.to = toDate.toISOString().split('T')[0];

  // ✅ Attach file paths
  if (files.experienceLetter?.[0]) exp.experienceLetter = toRelativeUploadPath(files.experienceLetter[0].path);
  if (files.relievingLetter?.[0]) exp.relievingLetter = toRelativeUploadPath(files.relievingLetter[0].path);
  if (files.payslip?.[0]) exp.payslip = toRelativeUploadPath(files.payslip[0].path);

  // ✅ Save experience
  form.workingDetails.experiences.push(exp);
  await form.save();

  res.json({ message: 'Experience added', data: form.workingDetails.experiences });
});


// UPDATE one experience
exports.updateExperience = asyncHandler(async (req, res) => {
  const { formId, expId } = req.params;
  const files = req.files || {};
  const updates = { ...req.body };

  if (files.experienceLetter?.[0]) updates.experienceLetter = toRelativeUploadPath(files.experienceLetter[0].path);
  if (files.relievingLetter?.[0]) updates.relievingLetter = toRelativeUploadPath(files.relievingLetter[0].path);
  if (files.payslip?.[0]) updates.payslip = toRelativeUploadPath(files.payslip[0].path);

  const form = await findByFormId(formId);
  const exp = form.workingDetails.experiences.id(expId);
  if (!exp) return res.status(404).json({ message: 'Experience not found' });

  Object.assign(exp, updates);
  await form.save();

  res.json({ message: 'Experience updated', data: exp });
});

// DELETE experience
exports.deleteExperience = asyncHandler(async (req, res) => {
  const { formId, expId } = req.params;
  const form = await findByFormId(formId);
  const exp = form.workingDetails.experiences.id(expId);
  if (!exp) return res.status(404).json({ message: 'Experience not found' });

  exp.remove();
  await form.save();

  res.json({ message: 'Experience deleted' });
});

// BANK Details
exports.updateBankDetails = asyncHandler(async (req, res) => {
  const { formId } = req.params;
  const body = { ...req.body };
  if (req.file) {
    body.bankPassbook = toRelativeUploadPath(req.file.path);
  }

  const form = await Form.findOneAndUpdate(
    { formId },
    { $set: { bankDetails: body } },
    { new: true, runValidators: true }
  );

  if (!form) return res.status(404).json({ message: 'Form not found' });
  res.json({ message: 'bankDetails updated', data: form.bankDetails });
});

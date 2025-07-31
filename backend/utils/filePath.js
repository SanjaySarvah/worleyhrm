const path = require('path');

function toRelativeUploadPath(filePath) {
  if (!filePath) return null;
  const uploadsIndex = filePath.lastIndexOf('uploads');
  if (uploadsIndex === -1) return filePath; // fallback
  return filePath.substring(uploadsIndex + 8).replace(/\\/g, '/'); // +8 to skip "uploads/"
}

module.exports = toRelativeUploadPath;

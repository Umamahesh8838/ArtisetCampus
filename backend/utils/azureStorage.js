const { BlobServiceClient } = require('@azure/storage-blob');
const path = require('path');
const logger = require('./logger');

let blobServiceClient;
let containerClient;

if (process.env.AZURE_STORAGE_CONNECTION_STRING && process.env.AZURE_CONTAINER_NAME) {
  try {
    blobServiceClient = BlobServiceClient.fromConnectionString(process.env.AZURE_STORAGE_CONNECTION_STRING);
    containerClient = blobServiceClient.getContainerClient(process.env.AZURE_CONTAINER_NAME);
  } catch (err) {
    logger.error('Failed to initialize Azure Blob Storage:', err.message);
  }
}

async function uploadToAzure(buffer, folderName, originalName, mimeType, studentId) {
  if (!containerClient) {
    throw new Error('Azure Storage is not configured. Missing AZURE_STORAGE_CONNECTION_STRING or AZURE_CONTAINER_NAME.');
  }

  const ext = path.extname(originalName) || '';
  const prefix = folderName === 'profile_pic' ? 'profile' : 'resume';
  
  // Use studentId to create a deterministic predictable filename so we can fetch it immediately
  // e.g., profile_pic/profile_2.jpg or resumes/resume_5.pdf
  const idStr = studentId ? studentId : Date.now(); 
  const blobName = "" + folderName + "/" + prefix + "_" + idStr + ext;

  const blockBlobClient = containerClient.getBlockBlobClient(blobName);

  await blockBlobClient.uploadData(buffer, {
    blobHTTPHeaders: { blobContentType: mimeType }
  });

  return blockBlobClient.url;
}

async function uploadProfilePic(file, studentId) {
  return await uploadToAzure(file.buffer, 'profile_pic', file.originalname, file.mimetype, studentId);
}

async function uploadResume(file, studentId) {
  return await uploadToAzure(file.buffer, 'resumes', file.originalname, file.mimetype, studentId);
}

module.exports = {
  uploadProfilePic,
  uploadResume
};

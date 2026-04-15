/**
 * MIGRATED TO campus6 schema
 * Updated: studentController-new.js with M2M operations and complete profile extraction
 * Profile includes: basic info, addresses, education, skills, languages, interests, certifications, work experience, projects
 */

const express = require('express');
const router = express.Router();
const studentController = require('../controllers/studentController');
const { authenticateToken } = require('../utils/authMiddleware');

// All student routes require authentication
router.use(authenticateToken);

// Dashboard - quick overview of applications, drives, interviews
router.get('/dashboard', studentController.getDashboardData);

// Student Profile - complete profile information
router.get('/profile', studentController.getStudentProfile);
router.put('/profile', studentController.updateStudentProfile);

// Address Management
router.put('/addresses/:addressId', studentController.updateStudentAddress);

// Skills Management (M2M with tbl_cp_mskills)
router.get('/skills', studentController.getStudentSkills);
router.post('/skills', studentController.addStudentSkill);
router.delete('/skills/:skillId', studentController.removeStudentSkill);

// Languages Management (M2M with tbl_cp_mlanguages)
router.get('/languages', studentController.getStudentLanguages);

// TODO: Implement remaining student profile management endpoints
// - Address Management (get, add, delete)
// - Interests Management
// - Certifications Management
// - Work Experience
// - Projects

module.exports = router;

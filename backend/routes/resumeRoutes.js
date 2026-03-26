const express = require('express');
const router = express.Router();
const multer = require('multer');
const FormData = require('form-data');
const axios = require('axios');
const { authenticateToken } = require('../utils/authMiddleware');
const logger = require('../utils/logger');

const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 8 * 1024 * 1024 } });

function mapParserToDraft(parsed) {
  const cleanNumber = (val) => {
    if (!val) return 0;
    if (typeof val === 'number') return val;
    const str = String(val).replace('%', '').split('/')[0].trim();
    return parseFloat(str) || 0;
  };

  const result = {
    basic: {
      firstName: parsed?.first_name || '',
      middleName: parsed?.middle_name || '',
      lastName: parsed?.last_name || '',
      email: parsed?.email || '',
      phone: parsed?.contact_number || '',
      linkedinUrl: parsed?.linkedin_url || '',
      githubUrl: parsed?.github_url || '',
      portfolioUrl: parsed?.portfolio_url || '',
      dateOfBirth: parsed?.date_of_birth || '',
      gender: parsed?.gender || '',
      currentCity: parsed?.current_city || '',
    },
    schoolEducation: (parsed?.school || []).map((s) => ({
      standard: s?.standard || '',
      // The parser often puts school name in `board`; we prefer school_name, else fallback to board.
      schoolName: s?.school_name || s?.board || '',
      // Leave board empty so the student can choose; do not auto-fill with school name.
      board: '',
      percentage: cleanNumber(s?.percentage),
      passingYear: cleanNumber(s?.passing_year),
    })),
    collegeEducation: (parsed?.education || []).map((e) => ({
      collegeName: e?.college_name || '',
      courseName: e?.course_name || '',
      specializationName: e?.specialization_name || '',
      startYear: cleanNumber(e?.start_year),
      endYear: cleanNumber(e?.end_year),
      cgpa: cleanNumber(e?.cgpa),
      percentage: cleanNumber(e?.percentage),
    })),
    workExperience: (parsed?.workexp || []).map((w) => ({
      companyName: w?.company_name || '',
      location: w?.company_location || '',
      designation: w?.designation || '',
      employmentType: w?.employment_type || '',
      startDate: w?.start_date || '',
      endDate: w?.end_date || '',
      isCurrent: !!w?.is_current,
    })),
    projects: (parsed?.projects || []).map((p) => ({
      title: p?.project_title || '',
      description: p?.project_description || '',
      achievements: p?.achievements || '',
      startDate: p?.project_start_date || '',
      endDate: p?.project_end_date || '',
      skillsUsed: Array.isArray(p?.skills_used) ? p.skills_used : [],
    })),
    skills: (parsed?.skills || []).map((s) => ({
      skillName: s?.name || '',
      proficiencyLevel: s?.complexity || 'Intermediate',
    })),
    languages: (parsed?.languages || []).map((l) => ({
      languageName: l?.language_name || '',
    })),
    certifications: (parsed?.certifications || []).map((c) => ({
      certificationName: c?.certification_name || '',
      issuingOrganization: c?.issuing_organization || '',
      certificationType: c?.certification_type || '',
      issueDate: c?.issue_date || '',
      expiryDate: c?.expiry_date || '',
      isLifetime: !!c?.is_lifetime,
      certificateUrl: c?.certificate_url || '',
      credentialId: c?.credential_id || '',
    })),
    interests: (parsed?.interests || []).map((i) => ({
      interestName: i?.name || '',
      isInferred: !!i?.is_inferred,
    })),
    address: (parsed?.addresses && parsed.addresses[0]) ? {
      addressLine1: parsed.addresses[0]?.address_line_1 || '',
      addressLine2: parsed.addresses[0]?.address_line_2 || '',
      landmark: parsed.addresses[0]?.landmark || '',
      pincode: parsed.addresses[0]?.pincode || '',
      cityName: parsed.addresses[0]?.city_name || '',
      stateName: parsed.addresses[0]?.state_name || '',
      countryName: parsed.addresses[0]?.country_name || '',
      addressType: parsed.addresses[0]?.address_type || '',
    } : undefined,
  };

  console.log("[RESUME PROXY] mapParserToDraft result:");
  console.log(JSON.stringify(result, null, 2));

  return result;
}

// Proxy and convert parser response
router.post('/parse-preview', authenticateToken, upload.single('file'), async (req, res) => {
  try {
    console.log("=".repeat(60));
    console.log("[RESUME] File received:", req.file?.originalname);
    console.log("[RESUME] File size:", req.file?.size, "bytes");

    console.log("=================================");
    console.log("[RESUME] Step 1: File received from frontend");
    console.log("[RESUME] File name:", req.file?.originalname);
    console.log("[RESUME] File size:", req.file?.size, "bytes");
    console.log("[RESUME] File type:", req.file?.mimetype);

    if (!req.file) return res.status(400).json({ message: 'File is required' });

    const form = new FormData();
    form.append('file', req.file.buffer, { filename: req.file.originalname, contentType: req.file.mimetype });

    console.log("[RESUME] Step 2: Calling resume parser at http://localhost:8000/resume/parse-preview");

    console.log("[RESUME] Calling parser at http://127.0.0.1:8000...");
    console.log("[RESUME] Waiting for Ollama response (may take 2-3 mins)...");

    const resp = await axios.post('http://127.0.0.1:8000/resume/parse-preview', form, {
      headers: { ...form.getHeaders() },
      timeout: 300000, // 5 minutes
    });

    console.log("[RESUME] Step 3: Got response from parser");
    console.log("[RESUME] Parser response status:", resp.status);

    const parserResponse = resp.data || {};
  console.log("[RESUME] Parser responded!");
  console.log("[RESUME] Full parser response:", JSON.stringify(parserResponse.data, null, 2));
    const parserData = parserResponse.data || {};
    const parsedResume = parserData.parsed || {};
    const resumeHash = parserData.resume_hash;

    console.log("[RESUME] Parser response data:", JSON.stringify(parserData, null, 2));

    if (!parserResponse.success) {
      console.error('Parser returned error:', parserResponse.error);
      return res.status(400).json({ message: parserResponse.error || 'Failed to parse resume' });
    }

    // Map parser response to registration draft format
    const mappedDraft = mapParserToDraft(parsedResume);

    console.log("[RESUME] Mapped draft:", JSON.stringify(mappedDraft, null, 2));

    console.log("[RESUME] Step 4: Mapped to registration draft format");
    console.log("[RESUME] Mapped data:", JSON.stringify(mappedDraft, null, 2));
    console.log("[RESUME] Step 5: Sending mapped data to frontend");
    console.log("[RESUME] Sending response to frontend");
    console.log("=".repeat(60));

    return res.json({ success: true, resume_hash: resumeHash, draft: mappedDraft });
  } catch (error) {
    console.error("[RESUME] ERROR:", error.message);
    console.error("[RESUME] Error detail:", error.response?.data || error);
    return res.status(500).json({ 
      message: 'Failed to parse resume',
      details: error.message,
      parserStatus: error.response?.status,
      parserError: error.response?.data?.error
    });
  }
});

// Proxy retrieve cached parsed data
router.get('/get-cached/:hash', authenticateToken, async (req, res) => {
  try {
    const { hash } = req.params;
    console.log("[RESUME] Fetching cached resume for hash:", hash);
    const response = await axios.get(`http://127.0.0.1:8000/resume/get-cached/${hash}`, { timeout: 60000 });
    return res.json(response.data);
  } catch (error) {
    console.error('[RESUME] ERROR fetching cached resume:', error.message);
    return res.status(500).json({ message: 'Failed to retrieve cached resume', details: error.message });
  }
});

// Proxy save-confirmed to parser
router.post('/save-confirmed', authenticateToken, express.json(), async (req, res) => {
  try {
    const body = req.body;
    if (!body || !body.resume_hash) return res.status(400).json({ message: 'resume_hash is required' });

    logger.info('Saving confirmed resume to parser:', body.resume_hash);

    await axios.post('http://127.0.0.1:8000/resume/save-confirmed', body, { timeout: 1800000 });
    logger.info('Resume saved to parser successfully');
    return res.json({ message: 'Saved to resume parser' });
  } catch (err) {
    logger.error('Error saving confirmed resume to parser:', err.message || err);
    // Do not reveal parser errors to client; just forward a generic error
    return res.status(502).json({ message: 'Failed to save confirmed resume' });
  }
});

module.exports = router;

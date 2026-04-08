const express = require('express');
const router = express.Router();
const multer = require('multer');
const FormData = require('form-data');
const axios = require('axios');
const { authenticateToken } = require('../utils/authMiddleware');
const logger = require('../utils/logger');

const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 8 * 1024 * 1024 } });

function mapParserToDraft(parsed) {
  try {
    console.log("[MAPPER] Input parsed data keys:", Object.keys(parsed || {}));
    
    const cleanNumber = (val) => {
      if (!val) return 0;
      if (typeof val === 'number') return val;
      const str = String(val).replace('%', '').split('/')[0].trim();
      return parseFloat(str) || 0;
    };

    // Try multiple possible field names for school and education
    const schoolDataFromApi = parsed?.school || parsed?.schooling || parsed?.school_education || [];
    const educationArray = parsed?.education || parsed?.college || parsed?.college_education || [];

    console.log("[MAPPER] School array found:", Array.isArray(schoolDataFromApi) ? schoolDataFromApi.length : 'NOT AN ARRAY', schoolDataFromApi);
    console.log("[MAPPER] Education array found:", Array.isArray(educationArray) ? educationArray.length : 'NOT AN ARRAY', educationArray);

    // Build school array with standard field (for frontend compatibility)
    const schoolArray = [];
    if (Array.isArray(schoolDataFromApi) && schoolDataFromApi.length > 0) {
      for (const s of schoolDataFromApi) {
        console.log("[MAPPER] Processing school entry:", s);
        const standard = String(s?.standard || s?.std || s?.class || '').toLowerCase().trim();
        
        let mappedStandard = '';
        // Check for various formats: X, XII, 10, 12, Class X, etc.
        if (standard.includes('x') && !standard.includes('xi')) {
          // This is "X" (10th)
          mappedStandard = '10th';
        } else if (standard.includes('xii') || standard.includes('12')) {
          // This is "XII" (12th)
          mappedStandard = '12th';
        } else if (standard === '10') {
          mappedStandard = '10th';
        } else if (standard === '12') {
          mappedStandard = '12th';
        }
        
        if (mappedStandard) {
          schoolArray.push({
            standard: mappedStandard,
            schoolName: s?.school_name || s?.school || s?.institution_name || '',
            board: s?.board || s?.board_name || s?.board_of_education || '',
            percentage: cleanNumber(s?.percentage || s?.marks || s?.score),
            passingYear: cleanNumber(s?.passing_year || s?.year || s?.year_of_passing),
          });
          console.log("[MAPPER] Added to school array:", { standard: mappedStandard, schoolName: s?.school_name });
        }
      }
    }

    // Build college array (in frontend format) - take first entry
    const collegeArray = [];
    if (Array.isArray(educationArray) && educationArray.length > 0) {
      const e = educationArray[0];
      console.log("[MAPPER] Processing college entry:", e);
      collegeArray.push({
        collegeName: e?.college_name || e?.college || e?.institution_name || e?.university || '',
        courseName: e?.course_name || e?.course || e?.degree || e?.program || '',
        specializationName: e?.specialization_name || e?.specialization || e?.major || '',
        startYear: cleanNumber(e?.start_year || e?.from_year || e?.year_from),
        endYear: cleanNumber(e?.end_year || e?.to_year || e?.year_to),
        cgpa: cleanNumber(e?.cgpa || e?.gpa || e?.grade),
        percentage: cleanNumber(e?.percentage || e?.marks || e?.score),
      });
      console.log("[MAPPER] College array:", collegeArray);
    }

    const result = {
      basic: {
        firstName: parsed?.first_name || parsed?.firstName || '',
        middleName: parsed?.middle_name || parsed?.middleName || '',
        lastName: parsed?.last_name || parsed?.lastName || '',
        email: parsed?.email || '',
        phone: parsed?.contact_number || parsed?.phone || '',
        linkedinUrl: parsed?.linkedin_url || parsed?.linkedinUrl || '',
        githubUrl: parsed?.github_url || parsed?.githubUrl || '',
        portfolioUrl: parsed?.portfolio_url || parsed?.portfolioUrl || '',
        dateOfBirth: parsed?.date_of_birth || parsed?.dob || '',
        gender: parsed?.gender || '',
        currentCity: parsed?.current_city || parsed?.city || '',
      },
      schoolEducation: schoolArray,  // Frontend mapper expects this field
      collegeEducation: collegeArray, // Frontend mapper expects this field
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
  } catch (mapError) {
    console.error("[MAPPER] ERROR in mapping:", mapError.message);
    console.error("[MAPPER] Error stack:", mapError.stack);
    // Return a safe empty structure if mapping fails
    return {
      basic: {},
      schoolEducation: [],
      collegeEducation: [],
      workExperience: [],
      projects: [],
      skills: [],
      languages: [],
      certifications: [],
      interests: [],
      address: {},
    };
  }
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

    console.log("[RESUME] Calling parser at https://resume-parser-api-hp-260406.azurewebsites.net...");
    console.log("[RESUME] Waiting for Ollama response (may take 2-3 mins)...");

    const resp = await axios.post('https://resume-parser-api-hp-260406.azurewebsites.net/resume/parse-preview', form, {
      headers: { ...form.getHeaders() },
      timeout: 300000, // 5 minutes
    });

    console.log("[RESUME] Step 3: Got response from parser");
    console.log("[RESUME] Parser response status:", resp.status);

    const parserResponse = resp.data || {};
    console.log("[RESUME] Parser responded!");
    console.log("[RESUME] Full parser response keys:", Object.keys(parserResponse));
    console.log("[RESUME] Full parser response:", JSON.stringify(parserResponse, null, 2));
    
    // The API response might be { success: boolean, data: { parsed: {...}, resume_hash: "..." } }
    // or it might be { parsed: {...}, resume_hash: "..." } directly
    const parserData = parserResponse.data || parserResponse;
    const parsedResume = parserData.parsed || parserData;
    const resumeHash = parserData.resume_hash || parserResponse.resume_hash;

    console.log("[RESUME] Parser data after extraction:", JSON.stringify(parserData, null, 2));
    console.log("[RESUME] Parsed resume (to be mapped):", JSON.stringify(parsedResume, null, 2));
    console.log("[RESUME] Resume hash:", resumeHash);

    // Check for explicit error flag (but don't fail if it's just missing)
    if (parserResponse.error || parserResponse.message && parserResponse.message.includes('error')) {
      console.error('Parser returned error:', parserResponse.error || parserResponse.message);
      return res.status(400).json({ message: parserResponse.error || parserResponse.message || 'Failed to parse resume' });
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
    console.error("[RESUME] Error stack:", error.stack);
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
    const response = await axios.get(`https://resume-parser-api-hp-260406.azurewebsites.net/resume/get-cached/${hash}`, { timeout: 60000 });
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

    await axios.post('https://resume-parser-api-hp-260406.azurewebsites.net/resume/save-confirmed', body, { timeout: 1800000 });
    logger.info('Resume saved to parser successfully');
    return res.json({ message: 'Saved to resume parser' });
  } catch (err) {
    logger.error('Error saving confirmed resume to parser:', err.message || err);
    // Do not reveal parser errors to client; just forward a generic error
    return res.status(502).json({ message: 'Failed to save confirmed resume' });
  }
});

module.exports = router;

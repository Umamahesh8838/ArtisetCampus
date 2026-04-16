/**
 * MIGRATED TO campus6 schema
 * Purpose: Resume parsing and preview - converts external resume parser output to campus6 format
 * Note: This is mostly a data transformation layer - the parser runs externally
 * Schema changes: Maps parser output to new schema field names for school/college/skills/languages
 */

const express = require('express');
const router = express.Router();
const multer = require('multer');
const FormData = require('form-data');
const axios = require('axios');
const { authenticateToken } = require('../utils/authMiddleware');
const logger = require('../utils/logger');

const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 8 * 1024 * 1024 } });

/**
 * Map external resume parser response to campus6 schema format
 * Handles:
 * - School education (tenth/twelfth standard)
 * - College education
 * - Work experience
 * - Projects
 * - Skills (M2M with tbl_cp_mskills)
 * - Languages (M2M with tbl_cp_mlanguages)
 * - Certifications (M2M with tbl_cp_mcertification)
 * - Interests (M2M with tbl_cp_minterests)
 */
function mapParserToDraft(parsed) {
  try {
    logger.info("[MAPPER] Mapping parser response to campus6 format");
    
    const cleanNumber = (val) => {
      if (!val) return 0;
      if (typeof val === 'number') return val;
      const str = String(val).replace('%', '').split('/')[0].trim();
      return parseFloat(str) || 0;
    };

    // Parse school data (tenth/twelfth)
    const schoolDataFromApi = parsed?.school || parsed?.schooling || parsed?.school_education || [];
    const schoolArray = [];
    if (Array.isArray(schoolDataFromApi) && schoolDataFromApi.length > 0) {
      for (const s of schoolDataFromApi) {
        const standard = String(s?.standard || s?.std || s?.class || '').toLowerCase().trim();
        
        let mappedStandard = '';
        if (standard.includes('x') && !standard.includes('xi')) {
          mappedStandard = '10th';
        } else if (standard.includes('xii') || standard.includes('12')) {
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
        }
      }
    }

    // Parse college data
    const educationArray = parsed?.education || parsed?.college || parsed?.college_education || [];
    const collegeArray = [];
    if (Array.isArray(educationArray) && educationArray.length > 0) {
      const e = educationArray[0];
      collegeArray.push({
        collegeName: e?.college_name || e?.college || e?.institution_name || e?.university || '',
        courseName: e?.course_name || e?.course || e?.degree || e?.program || '',
        specializationName: e?.specialization_name || e?.specialization || e?.major || '',
        startYear: cleanNumber(e?.start_year || e?.from_year || e?.year_from),
        endYear: cleanNumber(e?.end_year || e?.to_year || e?.year_to),
        cgpa: cleanNumber(e?.cgpa || e?.gpa || e?.grade),
        percentage: cleanNumber(e?.percentage || e?.marks || e?.score),
      });
    }

    const basicSource = parsed?.basic && typeof parsed.basic === 'object' ? parsed.basic : parsed;

    return {
      basic: {
        firstName: basicSource?.first_name || basicSource?.firstName || basicSource?.name?.first || '',
        middleName: basicSource?.middle_name || basicSource?.middleName || basicSource?.name?.middle || '',
        lastName: basicSource?.last_name || basicSource?.lastName || basicSource?.name?.last || '',
        email: basicSource?.email || basicSource?.contact?.email || '',
        phone: basicSource?.contact_number || basicSource?.phone || basicSource?.contact?.phone || basicSource?.phone_number || '',
        linkedinUrl: basicSource?.linkedin_url || basicSource?.linkedinUrl || basicSource?.linkedin || '',
        githubUrl: basicSource?.github_url || basicSource?.githubUrl || basicSource?.github || '',
        portfolioUrl: basicSource?.portfolio_url || basicSource?.portfolioUrl || basicSource?.portfolio || '',
        dateOfBirth: basicSource?.date_of_birth || basicSource?.dob || basicSource?.dateOfBirth || '',
        gender: basicSource?.gender || '',
        currentCity: basicSource?.current_city || basicSource?.city || basicSource?.currentCity || '',
      },
      schoolEducation: schoolArray,
      collegeEducation: collegeArray,
      workExperience: (parsed?.workexp || parsed?.work_experience || parsed?.workExperience || []).map((w) => ({
        companyName: w?.company_name || w?.company || w?.companyName || '',
        location: w?.company_location || w?.location || w?.companyLocation || '',
        designation: w?.designation || w?.job_title || w?.title || '',
        employmentType: w?.employment_type || w?.type || w?.employmentType || '',
        startDate: w?.start_date || w?.startDate || w?.from || '',
        endDate: w?.end_date || w?.endDate || w?.to || '',
        isCurrent: !!w?.is_current || !!w?.current || !!w?.isCurrent,
      })),
      projects: (parsed?.projects || []).map((p) => ({
        title: p?.project_title || p?.title || p?.projectTitle || '',
        description: p?.project_description || p?.description || p?.projectDescription || '',
        achievements: p?.achievements || p?.achievement || '',
        startDate: p?.project_start_date || p?.startDate || p?.from || '',
        endDate: p?.project_end_date || p?.endDate || p?.to || '',
        skillsUsed: Array.isArray(p?.skills_used) ? p.skills_used : Array.isArray(p?.skillsUsed) ? p.skillsUsed : [],
      })),
      skills: (parsed?.skills || []).map((s) => ({
        skillName: s?.name || s?.skill_name || s?.skillName || '',
        proficiencyLevel: s?.complexity || s?.proficiency || s?.proficiencyLevel || 'Intermediate',
      })),
      languages: (parsed?.languages || []).map((l) => ({
        languageName: l?.language_name || l?.language || l?.languageName || l?.name || '',
      })),
      certifications: (parsed?.certifications || []).map((c) => ({
        certificationName: c?.certification_name || c?.name || c?.certificationName || '',
        issuingOrganization: c?.issuing_organization || c?.issuer || c?.issuingOrganization || '',
        certificationType: c?.certification_type || c?.type || c?.certificationName || '',
        issueDate: c?.issue_date || c?.issueDate || '',
        expiryDate: c?.expiry_date || c?.expiryDate || '',
        isLifetime: !!c?.is_lifetime || !!c?.isLifetime,
        certificateUrl: c?.certificate_url || c?.url || c?.certificateUrl || '',
        credentialId: c?.credential_id || c?.credentialId || '',
      })),
      interests: (parsed?.interests || []).map((i) => ({
        interestName: i?.name || i?.interest_name || i?.interestName || (typeof i === 'string' ? i : ''),
        isInferred: !!i?.is_inferred || !!i?.inferred || !!i?.isInferred,
      })),
      address: (parsed?.addresses && parsed.addresses[0]) ? {
        addressLine1: parsed.addresses[0]?.address_line_1 || parsed.addresses[0]?.line1 || parsed.addresses[0]?.addressLine1 || '',
        addressLine2: parsed.addresses[0]?.address_line_2 || parsed.addresses[0]?.line2 || parsed.addresses[0]?.addressLine2 || '',
        landmark: parsed.addresses[0]?.landmark || '',
        pincode: parsed.addresses[0]?.pincode || parsed.addresses[0]?.zip || '',
        cityName: parsed.addresses[0]?.city_name || parsed.addresses[0]?.city || parsed.addresses[0]?.cityName || '',
        stateName: parsed.addresses[0]?.state_name || parsed.addresses[0]?.state || parsed.addresses[0]?.stateName || '',
        countryName: parsed.addresses[0]?.country_name || parsed.addresses[0]?.country || parsed.addresses[0]?.countryName || '',
        addressType: parsed.addresses[0]?.address_type || '',
      } : undefined,
    };
  } catch (mapError) {
    logger.error("[MAPPER] Error mapping parser response:", mapError.message);
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

/**
 * Parse resume from PDF/file and return preview in campus6 format
 */
router.post('/parse-preview', authenticateToken, upload.single('file'), async (req, res) => {
  try {
    logger.info("[RESUME] File received:", req.file?.originalname);
    
    if (!req.file) {
      return res.status(400).json({ error: 'File is required' });
    }

    // Call external resume parser
    const form = new FormData();
    form.append('file', req.file.buffer, { 
      filename: req.file.originalname, 
      contentType: req.file.mimetype 
    });

    logger.info("[RESUME] Calling external resume parser...");

    const parserResponse = await axios.post(
      process.env.RESUME_PARSER_URL || 'https://resume-parser-api-hp-260406.azurewebsites.net/resume/parse-preview',
      form,
      {
        headers: { ...form.getHeaders() },
        timeout: 300000, // 5 minutes
      }
    );

    logger.info("[RESUME] Parser response received, mapping to campus6 format");

    // Map parser response to campus6 schema
    const responseData = parserResponse.data || {};
    
    let parsedResume = responseData;
    let resumeHash = responseData.resume_hash || null;
    
    if (responseData.data && typeof responseData.data === 'object') {
      const wrappedData = responseData.data;
      if (wrappedData.parsed) {
        parsedResume = wrappedData.parsed;
        resumeHash = wrappedData.resume_hash || resumeHash;
      } else {
        parsedResume = wrappedData;
        resumeHash = wrappedData.resume_hash || resumeHash;
      }
    } else if (responseData.parsed && typeof responseData.parsed === 'object') {
      parsedResume = responseData.parsed;
      resumeHash = responseData.resume_hash || resumeHash;
    }
    
    const mappedDraft = mapParserToDraft(parsedResume);

    res.json({
      success: true,
      resume_hash: resumeHash,
      draft: mappedDraft,
      parserMetadata: {
        parsedAt: new Date().toISOString(),
        fileName: req.file.originalname,
        fileSize: req.file.size
      }
    });
  } catch (err) {
    logger.error("[RESUME] Parser error:", err.message);
    
    let parserErrorDetail = null;
    if (err.response) {
      logger.error("[RESUME] Parser error data:", JSON.stringify(err.response.data));
      parserErrorDetail = err.response.data;
    }
    
    if (err.code === 'ECONNREFUSED') {
      return res.status(503).json({ error: 'Resume parser service unavailable' });
    }
    
    if (err.code === 'ECONNABORTED') {
      return res.status(408).json({ error: 'Resume parsing timeout - file too large or parser busy' });
    }

    res.status(500).json({ error: 'Failed to parse resume', details: err.message, parserDetail: parserErrorDetail });
  }
});

module.exports = router;

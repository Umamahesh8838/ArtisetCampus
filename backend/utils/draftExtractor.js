// MIGRATED TO campus6 schema - Draft extraction from all student profile tables
// Updated table references to match new schema

const { pool } = require('../config/db');

/**
 * Extracts a complete student profile from relational DB tables and constructs 
 * the draft JSON structure expected by the frontend.
 */
async function buildDraftFromDb(user_id) {
    const draft = {};
    let conn;

    try {
        conn = await pool.getConnection();

        // 1. Basic details from tbl_cp_student
        const [studentRows] = await conn.execute(
            'SELECT * FROM tbl_cp_student WHERE student_id = ? LIMIT 1',
            [user_id]
        );
        
        if (studentRows.length > 0) {
            const s = studentRows[0];
            let salutationValue = '';
            
            try {
                if (s.salutation_id) {
                    const [salutation] = await conn.execute(
                        'SELECT value FROM tbl_cp_msalutation WHERE salutation_id = ?',
                        [s.salutation_id]
                    );
                    if (salutation.length) salutationValue = salutation[0].value;
                }
            } catch (e) {
                console.error('Error fetching salutation:', e.message);
            }

            draft.basic = {
                salutation: salutationValue,
                firstName: s.first_name || '',
                middleName: s.middle_name || '',
                lastName: s.last_name || '',
                email: s.email || '',
                alternateEmail: s.alt_email || '',
                contactNumber: s.contact_number || '',
                alternateContact: s.alt_contact_number || '',
                linkedIn: s.linkedin_url || '',
                github: s.github_url || '',
                portfolio: s.portfolio_url || '',
                dob: s.date_of_birth && s.date_of_birth !== '1900-01-01'
                    ? new Date(s.date_of_birth).toISOString().split('T')[0]
                    : '',
                gender: s.gender || '',
                city: s.current_city || '',
                status: s.is_active === 1
            };
        } else {
            draft.basic = {};
        }

        // 2. Addresses (with geography lookups)
        const [addrRows] = await conn.execute(
            `SELECT a.*, p.pincode, ct.city_name, st.state_name, co.country_name
             FROM tbl_cp_student_address a
             LEFT JOIN tbl_cp_mpincodes p ON a.pincode_id = p.pincode_id
             LEFT JOIN tbl_cp_mcities ct ON p.city_id = ct.city_id
             LEFT JOIN tbl_cp_mstates st ON ct.state_id = st.state_id
             LEFT JOIN tbl_cp_mcountries co ON st.country_id = co.country_id
             WHERE a.student_id = ?`,
            [user_id]
        );
        
        if (addrRows.length > 0) {
            draft.address = { current: {}, permanent: {} };
            for (const a of addrRows) {
                const addObj = {
                    line1: a.address_line_1 || '',
                    line2: a.address_line_2 || '',
                    careOf: a.care_of || '',
                    landmark: a.landmark || '',
                    area: a.area_name || '',
                    pincode: a.pincode || '',
                    city: a.city_name || '',
                    state: a.state_name || '',
                    country: a.country_name || '',
                    latitude: a.latitude || 0,
                    longitude: a.longitude || 0
                };
                
                if (a.address_type === 'current') draft.address.current = addObj;
                if (a.address_type === 'permanent') draft.address.permanent = addObj;
            }
        }

        // 3. School (10th, 12th separated by standard)
        const [schoolRows] = await conn.execute(
            'SELECT * FROM tbl_cp_student_school WHERE student_id ? ORDER BY standard',
            [user_id]
        );
        
        if (schoolRows.length > 0) {
            draft.school = {};
            for (const sc of schoolRows) {
                const scObj = {
                    board: sc.board || '',
                    school: sc.school_name || '',
                    percentage: sc.percentage ? String(sc.percentage) : '',
                    year: sc.passing_year ? String(sc.passing_year) : ''
                };
                
                const standard = (sc.standard || '').toLowerCase();
                if (standard.includes('10')) draft.school.tenth = scObj;
                else if (standard.includes('12')) draft.school.twelfth = scObj;
            }
        }

        // 4. College with course lookup
        const [collegeRows] = await conn.execute(
            `SELECT c.*, mc.college_name, crs.course_name
             FROM tbl_cp_student_education c
             LEFT JOIN tbl_cp_mcolleges mc ON c.college_id = mc.college_id
             LEFT JOIN tbl_cp_mcourses crs ON c.course_id = crs.course_id
             WHERE c.student_id = ? LIMIT 1`,
            [user_id]
        );
        
        if (collegeRows.length > 0) {
            const clg = collegeRows[0];
            draft.college = {
                college: clg.college_name || '',
                course: clg.course_name || '',
                specialization: clg.specialization_name || '',
                startYear: clg.start_year ? String(clg.start_year) : '',
                endYear: clg.end_year ? String(clg.end_year) : '',
                cgpa: clg.cgpa ? String(clg.cgpa) : '',
                percentage: clg.percentage ? String(clg.percentage) : ''
            };
        }

        // 5. Semesters with subject marks
        try {
            const [semRows] = await conn.execute(
                `SELECT sm.*, css.semester_id, subject_id, s.subject_name, css.credits
                 FROM tbl_cp_student_subject_marks sm
                 LEFT JOIN tbl_cp_college_sem_subject css ON sm.college_sem_subject_id = css.college_sem_subject_id
                 LEFT JOIN tbl_cp_msubjects s ON css.subject_id = s.subject_id
                 WHERE sm.student_id = ?
                 ORDER BY css.semester_id, s.subject_name`,
                [user_id]
            );
            
            if (semRows && semRows.length > 0) {
                const semMap = {};
                
                for (const row of semRows) {
                    if (!row.semester_id) continue;
                    
                    if (!semMap[row.semester_id]) {
                        semMap[row.semester_id] = {
                            id: String(row.semester_id),
                            name: `Semester ${row.semester_id}`,
                            subjects: {}
                        };
                    }
                    
                    const subjId = row.subject_id || 'unknown';
                    if (!semMap[row.semester_id].subjects[subjId]) {
                        semMap[row.semester_id].subjects[subjId] = {
                            id: String(subjId),
                            name: row.subject_name || `Subject ${subjId}`,
                            credits: parseFloat(row.credits) || 0,
                            internal: 0,
                            external: 0
                        };
                    }
                    
                    if (row.evaluation_type === 'internal') {
                        semMap[row.semester_id].subjects[subjId].internal = parseFloat(row.marks_obtained) || 0;
                    } else if (row.evaluation_type === 'external') {
                        semMap[row.semester_id].subjects[subjId].external = parseFloat(row.marks_obtained) || 0;
                    }
                }
                
                draft.semesters = Object.values(semMap).map(s => ({
                    ...s,
                    subjects: Object.values(s.subjects)
                }));
            }
        } catch (e) {
            console.error('Semesters extraction failed:', e.message);
        }

        // 6. Work Experience
        const [workRows] = await conn.execute(
            'SELECT * FROM tbl_cp_student_workexp WHERE student_id = ? ORDER BY start_date DESC',
            [user_id]
        );
        
        if (workRows.length > 0) {
            draft.workExperience = workRows.map(w => ({
                company: w.company_name,
                designation: w.designation,
                location: w.company_location,
                type: w.employment_type,
                startDate: w.start_date && w.start_date !== '1900-01-01'
                    ? new Date(w.start_date).toISOString().split('T')[0]
                    : '',
                endDate: w.end_date && w.end_date !== '1900-01-01'
                    ? new Date(w.end_date).toISOString().split('T')[0]
                    : '',
                current: w.is_current === 1
            }));
        }

        // 7. Projects
        const [projRows] = await conn.execute(
            'SELECT * FROM tbl_cp_studentprojects WHERE student_id = ? ORDER BY project_start_date DESC',
            [user_id]
        );
        
        if (projRows.length > 0) {
            draft.projects = projRows.map(p => ({
                title: p.project_title,
                description: p.project_description || '',
                startDate: p.project_start_date && p.project_start_date !== '1900-01-01'
                    ? new Date(p.project_start_date).toISOString().split('T')[0]
                    : '',
                endDate: p.project_end_date && p.project_end_date !== '1900-01-01'
                    ? new Date(p.project_end_date).toISOString().split('T')[0]
                    : '',
                achievements: p.achievements || ''
            }));
        }

        // 8. Skills via M2M
        const [skillRows] = await conn.execute(
            `SELECT sk.skill_id, sk.name, sk.complexity, sk.version
             FROM tbl_cp_m2m_std_skill m
             JOIN tbl_cp_mskills sk ON m.skill_id = sk.skill_id
             WHERE m.student_id = ?
             ORDER BY sk.name`,
            [user_id]
        );
        
        if (skillRows.length > 0) {
            draft.skills = skillRows.map(s => ({
                id: s.skill_id,
                name: s.name,
                version: s.version || '',
                complexity: s.complexity || 'Beginner'
            }));
        }

        // 9. Languages via M2M
        const [langRows] = await conn.execute(
            `SELECT l.language_id, l.language_name
             FROM tbl_cp_m2m_std_lng m
             JOIN tbl_cp_mlanguages l ON m.language_id = l.language_id
             WHERE m.student_id = ?
             ORDER BY l.language_name`,
            [user_id]
        );
        
        if (langRows.length > 0) {
            draft.languages = langRows.map(l => ({
                id: l.language_id,
                name: l.language_name
            }));
        }

        // 10. Interests via M2M
        const [intRows] = await conn.execute(
            `SELECT i.interest_id, i.name
             FROM tbl_cp_m2m_std_interest m
             JOIN tbl_cp_minterests i ON m.interest_id = i.interest_id
             WHERE m.student_id = ?
             ORDER BY i.name`,
            [user_id]
        );
        
        if (intRows.length > 0) {
            draft.interests = intRows.map(i => ({
                id: i.interest_id,
                name: i.name
            }));
        }

        // 11. Certifications via M2M
        const [certRows] = await conn.execute(
            `SELECT c.*, mc.certification_id, mc.certification_name, mc.issuing_organization
             FROM tbl_cp_m2m_student_certification c
             JOIN tbl_cp_mcertifications mc ON c.certification_id = mc.certification_id
             WHERE c.student_id = ?
             ORDER BY mc.certification_name`,
            [user_id]
        );
        
        if (certRows.length > 0) {
            draft.certifications = certRows.map(c => ({
                id: c.certification_id,
                name: c.certification_name,
                organization: c.issuing_organization,
                issueDate: c.issue_date && c.issue_date !== '1900-01-01'
                    ? new Date(c.issue_date).toISOString().split('T')[0]
                    : '',
                expiryDate: c.expiry_date && c.expiry_date !== '9999-12-31'
                    ? new Date(c.expiry_date).toISOString().split('T')[0]
                    : '',
                credentialId: c.credential_id || '',
                url: c.certificate_url || '',
                verified: c.is_verified === 1
            }));
        }

        return draft;

    } catch (e) {
        console.error("Error building draft from DB:", e.message);
        throw e;
    } finally {
        if (conn) conn.release();
    }
}

module.exports = { buildDraftFromDb };

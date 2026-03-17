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

        // 1. Basic details
        const [studentRows] = await conn.execute(`SELECT * FROM tbl_cp_student WHERE student_id = ? LIMIT 1`, [user_id]);
        if (studentRows.length > 0) {
            const s = studentRows[0];
            let salutationValue = '';
            try {
                if (s.salutation_id) {
                    const [salutation] = await conn.execute('SELECT value FROM tbl_cp_msalutation WHERE salutation_id = ?', [s.salutation_id]);
                    if (salutation.length) salutationValue = salutation[0].value;
                }
            } catch (e) {
                console.error('Error fetching salutation', e);
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
                photo: s.profile_photo_url || null,
                dob: s.date_of_birth ? new Date(s.date_of_birth).toISOString().split('T')[0] : undefined,
                gender: s.gender || '',
                city: s.current_city || '',
                status: s.is_active === 1
            };
        } else {
            draft.basic = {};
        }

        // 2. Address
        const [addrRows] = await conn.execute(`SELECT * FROM tbl_cp_student_address WHERE student_id = ?`, [user_id]);
        if (addrRows.length > 0) {
            draft.address = { current: {}, permanent: {} };
            for (const a of addrRows) {
                const addObj = {
                    line1: a.address_line_1 || '',
                    line2: a.address_line_2 || '',
                    careOf: a.care_of || '',
                    landmark: a.landmark || '',
                    city: a.city || '',
                    state: a.state || '',
                    pincode: a.pincode ? String(a.pincode) : '',
                    country: a.country || ''
                };
                if (a.address_type === 'current') draft.address.current = addObj;
                if (a.address_type === 'permanent') draft.address.permanent = addObj;
            }
        }

        // 3. School
        const [schoolRows] = await conn.execute(`SELECT * FROM tbl_cp_student_school WHERE student_id = ?`, [user_id]);
        if (schoolRows.length > 0) {
            draft.school = { tenth: {}, twelfth: {} };
            for (const sc of schoolRows) {
                const scObj = {
                    board: sc.board_name || '',
                    school: sc.school_name || '',
                    percentage: String(sc.percentage || ''),
                    year: sc.passing_year ? String(sc.passing_year) : ''
                };
                if (sc.school_type === '10th') draft.school.tenth = scObj;
                if (sc.school_type === '12th') draft.school.twelfth = scObj;
            }
        }

        // 4. College
        const [collegeRows] = await conn.execute(`
            SELECT c.*, mc.college_name as college_name, crs.course_name as course_name 
            FROM tbl_cp_student_education c
            LEFT JOIN tbl_cp_mcolleges mc ON c.college_id = mc.college_id
            LEFT JOIN tbl_cp_mcourses crs ON c.course_id = crs.course_id
            WHERE c.student_id = ? LIMIT 1`, [user_id]);
            
        if (collegeRows.length > 0) {
            const clg = collegeRows[0];
            draft.college = {
                college: clg.college_name || '',
                course: clg.course_name || '',
                specialization: clg.specialization || '',
                startYear: clg.start_year ? String(clg.start_year) : '',
                endYear: clg.end_year ? String(clg.end_year) : '',
                cgpa: clg.cgpa ? String(clg.cgpa) : '',
                percentage: clg.percentage ? String(clg.percentage) : ''
            };
        }

        // 5. Semesters
        // 5. Semesters
        try {
            const [semRows] = await conn.execute(`
                SELECT sm.*, css.semester_id, css.subject_id
                FROM tbl_cp_student_subject_marks sm
                LEFT JOIN tbl_cp_college_sem_subject css ON sm.college_sem_subject_id = css.row_id
                WHERE sm.student_id = ?
            `, [user_id]);
            
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
                            name: `Subject ${subjId}`,
                            credits: 0,
                            internal: 0,
                            external: 0
                        };
                    }
                    
                    if (row.evaluation_type === 'internal') {
                        semMap[row.semester_id].subjects[subjId].internal = parseFloat(row.marks_obtained);
                    } else if (row.evaluation_type === 'external') {
                        semMap[row.semester_id].subjects[subjId].external = parseFloat(row.marks_obtained);
                    }
                }
                draft.semesters = Object.values(semMap).map(s => ({
                    ...s,
                    subjects: Object.values(s.subjects)
                }));
            }
        } catch (e) {
            console.error('Semesters extraction failed', e);
        }

        // 6. Work Experience
        const [workRows] = await conn.execute(`SELECT * FROM tbl_cp_student_workexp WHERE student_id = ?`, [user_id]);
        if (workRows.length > 0) {
            draft.work = workRows.map(w => ({
                company: w.company_name,
                designation: w.designation,
                location: w.location,
                type: w.employment_type,
                startDate: w.start_date ? new Date(w.start_date).toISOString().split('T')[0] : '',
                endDate: w.end_date ? new Date(w.end_date).toISOString().split('T')[0] : '',
                current: w.is_current === 1,
                description: w.description
            }));
        }

        // 7. Projects
        const [projRows] = await conn.execute(`SELECT * FROM tbl_cp_studentprojects WHERE student_id = ?`, [user_id]);
        if (projRows.length > 0) {
            draft.projects = projRows.map(p => ({
                title: p.project_title,
                description: p.description,
                startDate: p.start_month_year ? new Date(p.start_month_year).toISOString().split('T')[0] : '',
                endDate: p.end_month_year ? new Date(p.end_month_year).toISOString().split('T')[0] : '',
                achievements: 'Extracted from DB',
                skills: [] // Needs m2m join
            }));
        }

        // 8. Skills
        const [skillRows] = await conn.execute(`
            SELECT sk.name FROM tbl_cp_m2m_std_skill m
            JOIN tbl_cp_mskills sk ON m.skill_id = sk.skill_id
            WHERE m.student_id = ?
        `, [user_id]);
        if (skillRows.length > 0) {
            draft.skills = skillRows.map(s => ({
                name: s.name,
                version: '',
                complexity: '',
                active: true
            }));
        }

        // 9. Languages
        const [langRows] = await conn.execute(`
            SELECT l.language_name FROM tbl_cp_m2m_std_lng m
            JOIN tbl_cp_mlanguages l ON m.language_id = l.language_id
            WHERE m.student_id = ?
        `, [user_id]);
        if (langRows.length > 0) {
            draft.languages = langRows.map(l => l.language_name);
        }

        // 10. Interests
        const [intRows] = await conn.execute(`
            SELECT i.name FROM tbl_cp_m2m_std_interest m
            JOIN tbl_cp_minterests i ON m.interest_id = i.interest_id
            WHERE m.student_id = ?
        `, [user_id]);
        if (intRows.length > 0) {
            draft.interests = intRows.map(i => i.name);
        }

        // 11. Certifications
        const [certRows] = await conn.execute(`
            SELECT c.*, mc.certification_name, mc.issuing_organization FROM tbl_cp_m2m_student_certification c
            JOIN tbl_cp_mcertifications mc ON c.certification_id = mc.certification_id
            WHERE c.student_id = ?
        `, [user_id]);
        if (certRows.length > 0) {
            draft.certifications = certRows.map(c => ({
                name: c.certification_name,
                organization: c.issuing_organization,
                issueDate: c.issue_date ? new Date(c.issue_date).toISOString().split('T')[0] : '',
                expiryDate: c.expiry_date ? new Date(c.expiry_date).toISOString().split('T')[0] : '',
                credentialId: c.credential_id,
                url: c.certificate_url,
                verified: c.is_verified === 1
            }));
        }

        return draft;

    } catch (e) {
        console.error("Error building draft from DB", e);
        return null; // Fallback
    } finally {
        if (conn) conn.release();
    }
}

module.exports = { buildDraftFromDb };

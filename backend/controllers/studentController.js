const { pool } = require('../config/db');

async function getDashboardData(req, res) {
    const { user_id } = req.user;

    try {
        // 1. Applications Count & List
        const [apps] = await pool.execute(`
      SELECT a.application_id as id, c.name as company, jd.job_role as role, a.status 
      FROM tbl_cp_application a
      JOIN tbl_cp_recruitment_drive d ON a.drive_id = d.drive_id
      JOIN tbl_cp_job_description jd ON d.jd_id = jd.jd_id
      JOIN tbl_cp_mcompany c ON jd.company_id = c.company_id
      WHERE a.student_id = ?
    `, [user_id]);

        // 2. Open Drives
        const [drives] = await pool.execute(`
      SELECT d.drive_id as id, c.name as company, jd.job_role as role, jd.location, 
             CONCAT(jd.experience_min_yrs, '-', jd.experience_max_yrs, ' Yrs') as experience,
             SUBSTRING(c.name, 1, 1) as logo, d.status
      FROM tbl_cp_recruitment_drive d
      JOIN tbl_cp_job_description jd ON d.jd_id = jd.jd_id
      JOIN tbl_cp_mcompany c ON jd.company_id = c.company_id
      WHERE d.status = 'Active'
      ORDER BY d.start_date DESC LIMIT 5
    `);

        // 3. Upcoming Interview
        const [interviews] = await pool.execute(`
      SELECT i.session_date as date, c.name as company 
      FROM tbl_cp_interview_session i
      JOIN tbl_cp_application a ON i.application_id = a.application_id
      JOIN tbl_cp_recruitment_drive d ON a.drive_id = d.drive_id
      JOIN tbl_cp_job_description jd ON d.jd_id = jd.jd_id
      JOIN tbl_cp_mcompany c ON jd.company_id = c.company_id
      WHERE a.student_id = ? AND i.session_date >= CURDATE()
      ORDER BY i.session_date ASC LIMIT 1
    `, [user_id]);

        let upcomingInterview = null;
        if (interviews.length > 0) {
            upcomingInterview = {
                date: new Date(interviews[0].date).toLocaleDateString(),
                company: interviews[0].company
            };
        }

        // 4. Certifications Count
        const [certs] = await pool.execute('SELECT COUNT(*) as count FROM tbl_cp_m2m_student_certification WHERE student_id = ?', [user_id]);
        const certCount = certs[0].count;

        // 5. Skills Count
        const [skills] = await pool.execute('SELECT COUNT(*) as count FROM tbl_cp_m2m_std_skill WHERE student_id = ?', [user_id]);
        const skillCount = skills[0].count;

        // 6. CGPA Max
        const [edu] = await pool.execute('SELECT MAX(cgpa) as max_cgpa FROM tbl_cp_student_education WHERE student_id = ?', [user_id]);
        const cgpa = edu[0].max_cgpa || 0;

        return res.json({
            applications: apps,
            applicationCount: apps.length,
            openDrives: drives.map(d => ({ ...d, experience: d.experience.replace('.0', '') })),
            upcomingInterview,
            certifications: certCount,
            skills: skillCount,
            cgpa: parseFloat(cgpa).toFixed(1)
        });

    } catch (err) {
        const logger = require('../utils/logger');
        logger.error('getDashboardData error:', err);
        return res.status(500).json({ message: 'Internal server error' });
    }
}

module.exports = {
    getDashboardData
};

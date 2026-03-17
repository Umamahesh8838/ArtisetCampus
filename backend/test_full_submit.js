require('dotenv').config();
const mysql = require('mysql2/promise');

// Full payload simulation — exactly what submitRegistration does with a real draft
async function main() {
  const pool = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
  });
  
  const { resolvePincodeId, resolveCollegeId, resolveCourseId, resolveSkillId, resolveLanguageId, resolveInterestId, resolveCertificationId } = require('./utils/masterHelpers2');
  
  const user_id = 2;
  const conn = await pool.getConnection();

  try {
    await conn.beginTransaction();

    const [uRows] = await conn.execute('SELECT * FROM users WHERE id=?', [user_id]);
    const u = uRows[0];
    console.log('User:', u.first_name, u.last_name);

    // tbl_cp_student UPDATE
    const [existing] = await conn.execute('SELECT student_id FROM tbl_cp_student WHERE student_id=?', [user_id]);
    if (existing.length > 0) {
      await conn.execute(`UPDATE tbl_cp_student SET salutation_id=1,first_name=?,last_name=?,email=?,contact_number=?,linkedin_url=?,github_url=?,date_of_birth=?,gender=?,status=? WHERE student_id=?`,
        ['Rahul','Sharma',u.email,'9876543210','https://linkedin.com/in/rahul','https://github.com/rahul','2001-05-15','Male','Active',user_id]);
    } else {
      await conn.execute(`INSERT INTO tbl_cp_student (student_id,salutation_id,first_name,last_name,email,contact_number,linkedin_url,github_url,date_of_birth,gender,user_type,is_active,status) VALUES (?,1,?,?,?,?,?,?,?,?,'Student',1,'Active')`,
        [user_id,'Rahul','Sharma',u.email,'9876543210','https://linkedin.com/in/rahul','https://github.com/rahul','2001-05-15','Male']);
    }
    console.log('✅ tbl_cp_student');

    // Address
    await conn.execute('DELETE FROM tbl_cp_student_address WHERE student_id=?', [user_id]);
    const pinId = await resolvePincodeId(conn, '500001', 'Hyderabad', 'Telangana', 'India');
    await conn.execute(`INSERT INTO tbl_cp_student_address (student_id,address_line_1,address_line_2,landmark,pincode_id,address_type) VALUES (?,?,?,?,?,?)`,
      [user_id,'123 MG Road','Banjara Hills','','current', pinId]);
    console.log('✅ address (pinId =', pinId, ')');

    // School 
    await conn.execute('DELETE FROM tbl_cp_student_school WHERE student_id=?', [user_id]);
    await conn.execute(`INSERT INTO tbl_cp_student_school (student_id,standard,board,school_name,percentage,passing_year) VALUES (?,?,?,?,?,?)`,
      [user_id,'10th','CBSE','St Mary High School',85,'2017']);
    await conn.execute(`INSERT INTO tbl_cp_student_school (student_id,standard,board,school_name,percentage,passing_year) VALUES (?,?,?,?,?,?)`,
      [user_id,'12th','CBSE','Delhi Public School',80,'2019']);
    console.log('✅ school');

    // College
    await conn.execute('DELETE FROM tbl_cp_student_education WHERE student_id=?', [user_id]);
    const colId = await resolveCollegeId(conn, 'JNTU Hyderabad');
    const corId = await resolveCourseId(conn, 'B.Tech');
    await conn.execute(`INSERT INTO tbl_cp_student_education (student_id,college_id,course_id,start_year,end_year,cgpa,percentage) VALUES (?,?,?,?,?,?,?)`,
      [user_id,colId,corId,'2019','2023',8.5,0]);
    console.log('✅ college (colId=',colId,'corId=',corId,')');

    // Semester marks
    await conn.execute('DELETE FROM tbl_cp_student_subject_marks WHERE student_id=?', [user_id]);
    await conn.execute(`INSERT INTO tbl_cp_student_subject_marks (student_id,semester_name,subject_name,credits,internal_marks,external_marks,total_marks,grade) VALUES (?,?,?,?,?,?,?,?)`,
      [user_id,'Semester 1','Mathematics',4,35,65,100,'']);
    console.log('✅ semester marks');

    // Work experience
    await conn.execute('DELETE FROM tbl_cp_student_workexp WHERE student_id=?', [user_id]);
    await conn.execute(`INSERT INTO tbl_cp_student_workexp (student_id,company_name,designation,employment_type,start_date,end_date,is_current) VALUES (?,?,?,?,?,?,?)`,
      [user_id,'TCS','Software Engineer','Full-Time','2023-07-01',null,1]);
    console.log('✅ work experience');

    // Projects
    await conn.execute('DELETE FROM tbl_cp_studentprojects WHERE student_id=?', [user_id]);
    await conn.execute(`INSERT INTO tbl_cp_studentprojects (student_id,project_title,project_description,achievements,project_start_date,project_end_date) VALUES (?,?,?,?,?,?)`,
      [user_id,'Campus Portal','A student management system','',null,null]);
    console.log('✅ projects');

    // Skills
    await conn.execute('DELETE FROM tbl_cp_m2m_std_skill WHERE student_id=?', [user_id]);
    for (const name of ['JavaScript','React','Node.js']) {
      const sId = await resolveSkillId(conn, name);
      await conn.execute('INSERT IGNORE INTO tbl_cp_m2m_std_skill (student_id,skill_id) VALUES (?,?)', [user_id, sId]);
    }
    console.log('✅ skills');

    // Languages
    await conn.execute('DELETE FROM tbl_cp_m2m_std_lng WHERE student_id=?', [user_id]);
    for (const name of ['English','Telugu']) {
      const lId = await resolveLanguageId(conn, name);
      await conn.execute('INSERT IGNORE INTO tbl_cp_m2m_std_lng (student_id,language_id) VALUES (?,?)', [user_id, lId]);
    }
    console.log('✅ languages');

    // Interests
    await conn.execute('DELETE FROM tbl_cp_m2m_std_interest WHERE student_id=?', [user_id]);
    for (const name of ['Web Development','Cricket']) {
      const iId = await resolveInterestId(conn, name);
      await conn.execute('INSERT IGNORE INTO tbl_cp_m2m_std_interest (student_id,interest_id) VALUES (?,?)', [user_id, iId]);
    }
    console.log('✅ interests');

    // Certifications
    await conn.execute('DELETE FROM tbl_cp_m2m_student_certification WHERE student_id=?', [user_id]);
    const cId = await resolveCertificationId(conn, 'AWS Cloud Practitioner', 'Amazon Web Services');
    await conn.execute('INSERT IGNORE INTO tbl_cp_m2m_student_certification (student_id,certification_id,issue_date,expiry_date,certificate_url) VALUES (?,?,?,?,?)',
      [user_id, cId, '2023-01-15', null, '']);
    console.log('✅ certifications');

    await conn.rollback(); // Don't commit — just testing
    console.log('\n🎉 ALL STEPS PASSED — Registration would succeed!');
  } catch(e) {
    await conn.rollback();
    console.error('\n❌ FAILED:', e.message);
    if (e.sql) console.error('SQL:', e.sql.substring(0, 300));
  } finally {
    conn.release();
    await pool.end();
  }
}

main().catch(e => { console.error(e.message); process.exit(1); });

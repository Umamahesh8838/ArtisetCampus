const { pool } = require('../config/db');

// Minimal, consistent helpers to avoid schema errors. These are defensive but
// intentionally simple: they try to reuse rows and insert minimal columns.

async function resolveGenericId(tableName, idColumn, matchColumn, value, connection = pool) {
  if (!value) return null;
  const valStr = String(value).trim();
  if (!valStr) return null;
  const [rows] = await connection.execute(`SELECT ${idColumn} FROM ${tableName} WHERE LOWER(${matchColumn}) = LOWER(?) LIMIT 1`, [valStr]);
  if (rows && rows.length) return rows[0][idColumn];
  // Use insertWithNextId to avoid race conditions on legacy tables without AUTO_INCREMENT
  const nid = await insertWithNextId(connection, tableName, idColumn, [matchColumn], [valStr]);
  return nid;
}

async function resolveLanguageId(connection, languageName) {
  return await resolveGenericId('tbl_cp_mlanguages', 'language_id', 'language_name', languageName, connection);
}

async function resolveSkillId(connection, skillName) {
  if (!skillName) return null;
  const valStr = String(skillName).trim();
  if (!valStr) return null;
  const [rows] = await connection.execute(`SELECT skill_id FROM tbl_cp_mskills WHERE LOWER(name) = LOWER(?) LIMIT 1`, [valStr]);
  if (rows && rows.length) return rows[0].skill_id;
  
  // Provide manual default values for NOT NULL columns to avoid database constraint errors
  const dataColumns = ['name', 'version', 'complexity', 'status'];
  const dataValues = [valStr, 'N/A', 'Beginner', 'Active'];
  
  return await insertWithNextId(connection, 'tbl_cp_mskills', 'skill_id', dataColumns, dataValues);
}

async function resolveInterestId(connection, interestName) {
  return await resolveGenericId('tbl_cp_minterests', 'interest_id', 'name', interestName, connection);
}

async function resolveCertificationId(connection, certName, issuer) {
  if (!certName) return null;
  const valStr = String(certName).trim();
  const [rows] = await connection.execute(`SELECT certification_id FROM tbl_cp_mcertifications WHERE LOWER(certification_name)=LOWER(?) LIMIT 1`, [valStr]);
  if (rows && rows.length) return rows[0].certification_id;
  
  const genCode = valStr.toUpperCase().replace(/[^A-Z0-9]/g, '').substring(0, 50) + '_' + Math.floor(Math.random()*10000);
  const nid = await insertWithNextId(connection, 'tbl_cp_mcertifications', 'certification_id', ['certification_name','certification_code','issuing_organization'], [valStr, genCode, issuer || 'Unknown']);
  return nid;
}

async function getNextId(connection, tableName, idColumn) {
  const [[{ next_id }]] = await connection.execute(`SELECT COALESCE(MAX(${idColumn}),0)+1 AS next_id FROM ${tableName}`);
  return next_id;
}

async function insertWithNextId(connection, tableName, idColumn, dataColumns, dataValues, maxRetries = 5) {
  // dataColumns: array of column names (without idColumn)
  // dataValues: array of values matching dataColumns
  for (let attempt = 0; attempt < maxRetries; attempt++) {
    const nid = await getNextId(connection, tableName, idColumn);
    const cols = [idColumn, ...dataColumns];
    const placeholders = cols.map(() => '?').join(', ');
    const sql = `INSERT INTO ${tableName} (${cols.join(', ')}) VALUES (${placeholders})`;
    const vals = [nid, ...dataValues];
    try {
      await connection.execute(sql, vals);
      return nid;
    } catch (err) {
      if (err && err.code === 'ER_DUP_ENTRY') {
        // race: someone inserted same id or same unique key; try again
        // 1. Try to find the record that was just inserted by another transaction using a locking read (which bypasses REPEATABLE READ snapshot).
        const matchCol = dataColumns[0];
        const matchVal = dataValues[0];
        const [rows] = await connection.execute(
          `SELECT ${idColumn} FROM ${tableName} WHERE LOWER(${matchCol}) = LOWER(?) FOR UPDATE`,
          [String(matchVal).trim()]
        );
        if (rows && rows.length > 0) {
          return rows[0][idColumn]; // Successfully retrieved the ID inserted by the concurrent request
        }
        // 2. If it wasn't the unique key (matchCol) that collided, it means our generated `nid` collided. Just continue and pick a new MAX(id)+1.
        continue;
      }
      throw err;
    }
  }
  throw new Error(`Failed to insert into ${tableName} after ${maxRetries} attempts`);
}

async function resolvePincodeId(connection, pincodeStr) {
  if (!pincodeStr) return null;
  const p = String(pincodeStr).trim();
  const [rows] = await connection.execute(`SELECT row_id, pincode_id FROM tbl_cp_mpincodes WHERE pincode = ? LIMIT 1`, [p]);
  if (rows && rows.length) return rows[0].row_id || rows[0].pincode_id;
  const nid = await insertWithNextId(connection, 'tbl_cp_mpincodes', 'pincode_id', ['pincode','area_name'], [p, p]);
  return nid;
}

// Upsert country -> state -> city -> pincode chain inside the provided connection.
// Uses SELECT first, otherwise inserts with manual next-id (COALESCE(MAX(...),0)+1) to match legacy schema.
async function upsertGeographyChain(connection, countryName, stateName, cityName, pincodeStr, areaName) {
  if (!pincodeStr) return null;
  const country = countryName ? String(countryName).trim() : null;
  const state = stateName ? String(stateName).trim() : null;
  const city = cityName ? String(cityName).trim() : null;
  const pincode = String(pincodeStr).trim();
  const area = areaName ? String(areaName).trim() : pincode;

  // 1. Country
  let countryId = null;
  if (country) {
    const [crows] = await connection.execute(`SELECT country_id FROM tbl_cp_mcountries WHERE LOWER(country_name)=LOWER(?) LIMIT 1`, [country]);
    if (crows && crows.length) countryId = crows[0].country_id;
    else {
      const nid = await insertWithNextId(connection, 'tbl_cp_mcountries', 'country_id', ['country_name'], [country]);
      countryId = nid;
    }
  }

  // 2. State
  let stateId = null;
  if (state) {
    const [srows] = await connection.execute(`SELECT state_id FROM tbl_cp_mstates WHERE LOWER(state_name)=LOWER(?)` + (countryId ? ' AND country_id = ?' : ' LIMIT 1'), countryId ? [state, countryId] : [state]);
    if (srows && srows.length) stateId = srows[0].state_id;
    else {
      const nid = countryId ? await insertWithNextId(connection, 'tbl_cp_mstates', 'state_id', ['state_name','country_id'], [state, countryId]) : await insertWithNextId(connection, 'tbl_cp_mstates', 'state_id', ['state_name'], [state]);
      stateId = nid;
    }
  }

  // 3. City
  let cityId = null;
  if (city) {
    const params = stateId ? [city, stateId] : [city];
    const [cirows] = await connection.execute(`SELECT city_id FROM tbl_cp_mcities WHERE LOWER(city_name)=LOWER(?)` + (stateId ? ' AND state_id = ?' : ' LIMIT 1'), params);
    if (cirows && cirows.length) cityId = cirows[0].city_id;
    else {
      const nid = stateId ? await insertWithNextId(connection, 'tbl_cp_mcities', 'city_id', ['city_name','state_id'], [city, stateId]) : await insertWithNextId(connection, 'tbl_cp_mcities', 'city_id', ['city_name'], [city]);
      cityId = nid;
    }
  }

  // 4. Pincode
  // First try to find an existing pincode row by pincode value (uniqueness may be on pincode)
  const [existingP] = await connection.execute(`SELECT pincode_id FROM tbl_cp_mpincodes WHERE pincode = ? LIMIT 1`, [pincode]);
  if (existingP && existingP.length) return existingP[0].pincode_id;

  const nid = await getNextId(connection, 'tbl_cp_mpincodes', 'pincode_id');
  try {
    if (cityId) {
      await connection.execute(`INSERT INTO tbl_cp_mpincodes (pincode_id, pincode, area_name, city_id) VALUES (?, ?, ?, ?)`, [nid, pincode, area, cityId]);
    } else {
      await connection.execute(`INSERT INTO tbl_cp_mpincodes (pincode_id, pincode, area_name) VALUES (?, ?, ?)`, [nid, pincode, area]);
    }
    return nid;
  } catch (err) {
    // If another concurrent process inserted the same pincode between our select and insert,
    // fallback to selecting the existing row.
    if (err && err.code === 'ER_DUP_ENTRY') {
      const [rows] = await connection.execute(`SELECT pincode_id FROM tbl_cp_mpincodes WHERE pincode = ? LIMIT 1`, [pincode]);
      if (rows && rows.length) return rows[0].pincode_id;
    }
    throw err;
  }
}

async function resolveCollegeId(connection, collegeName) {
  if (!collegeName) return null;
  const name = String(collegeName).trim();
  const [rows] = await connection.execute(`SELECT college_id FROM tbl_cp_mcolleges WHERE LOWER(college_name)=LOWER(?) LIMIT 1`, [name]);
  if (rows && rows.length) return rows[0].college_id;
  const nid = await insertWithNextId(connection, 'tbl_cp_mcolleges', 'college_id', ['college_name'], [name]);
  return nid;
}
async function resolveCourseId(connection, courseName) {
  if (!courseName) return null;
  const name = String(courseName).trim();
  const [rows] = await connection.execute(`SELECT course_id FROM tbl_cp_mcourses WHERE LOWER(course_name)=LOWER(?) LIMIT 1`, [name]);
  if (rows && rows.length) return rows[0].course_id;
  const nid = await insertWithNextId(connection, 'tbl_cp_mcourses', 'course_id', ['course_name'], [name]);
  return nid;
}

module.exports = {
  resolveLanguageId,
  resolveSkillId,
  resolveInterestId,
  resolveCertificationId,
  resolvePincodeId,
  resolveCollegeId,
  resolveCourseId,
  getNextId,
  resolveGenericId,
  upsertGeographyChain
  , insertWithNextId
};

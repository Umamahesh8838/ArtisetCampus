const db = require('../config/db');

exports.getCountries = async (req, res) => {
    try {
        const [rows] = await db.pool.query('SELECT country_id, country_name, country_code FROM tbl_cp_mcountries ORDER BY country_name ASC');
        res.json({ success: true, count: rows.length, data: rows });
    } catch (error) {
        console.error('Error fetching countries:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

exports.getStates = async (req, res) => {
    try {
        const { country_id } = req.params;
        const [rows] = await db.pool.query('SELECT state_id, state_name, state_code FROM tbl_cp_mstates WHERE country_id = ? ORDER BY state_name ASC', [country_id]);
        res.json({ success: true, count: rows.length, data: rows });
    } catch (error) {
        console.error('Error fetching states:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

exports.getCities = async (req, res) => {
    try {
        const { state_id } = req.params;
        const [rows] = await db.pool.query('SELECT city_id, city_name FROM tbl_cp_mcities WHERE state_id = ? ORDER BY city_name ASC', [state_id]);
        res.json({ success: true, count: rows.length, data: rows });
    } catch (error) {
        console.error('Error fetching cities:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

exports.getPincodes = async (req, res) => {
    try {
        const { city_id } = req.params;
        const [rows] = await db.pool.query('SELECT pincode_id, pincode, area_name FROM tbl_cp_mpincodes WHERE city_id = ? ORDER BY area_name ASC', [city_id]);
        res.json({ success: true, count: rows.length, data: rows });
    } catch (error) {
        console.error('Error fetching pincodes:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

exports.getLanguages = async (req, res) => {
    try {
        const [rows] = await db.pool.query('SELECT language_id, language_name, language_code FROM tbl_cp_mlanguages ORDER BY language_name ASC');
        res.json({ success: true, count: rows.length, data: rows });
    } catch (error) {
        console.error('Error fetching languages:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

exports.getSalutations = async (req, res) => {
    try {
        const [rows] = await db.pool.query('SELECT salutation_id, value FROM tbl_cp_msalutation ORDER BY salutation_id ASC');
        res.json({ success: true, count: rows.length, data: rows });
    } catch (error) {
        console.error('Error fetching salutations:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

exports.getCourses = async (req, res) => {
    try {
        const [rows] = await db.pool.query('SELECT course_id, course_name, specialization_name, course_code, specialization_code FROM tbl_cp_mcourses ORDER BY course_name ASC, specialization_name ASC');
        res.json({ success: true, count: rows.length, data: rows });
    } catch (error) {
        console.error('Error fetching courses:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

exports.getSkills = async (req, res) => {
    try {
        const [rows] = await db.pool.query('SELECT skill_id, name, version, complexity FROM tbl_cp_mskills WHERE status = "Active" ORDER BY name ASC');
        res.json({ success: true, count: rows.length, data: rows });
    } catch (error) {
        console.error('Error fetching skills:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

exports.getInterests = async (req, res) => {
    try {
        const [rows] = await db.pool.query('SELECT interest_id, name FROM tbl_cp_minterests ORDER BY name ASC');
        res.json({ success: true, count: rows.length, data: rows });
    } catch (error) {
        console.error('Error fetching interests:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};


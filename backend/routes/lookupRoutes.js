const express = require('express');
const router = express.Router();
const lookupController = require('../controllers/lookupController');

// Geography
router.get('/countries', lookupController.getCountries);
router.get('/states/:country_id', lookupController.getStates);
router.get('/cities/:state_id', lookupController.getCities);
router.get('/pincodes/:city_id', lookupController.getPincodes);

// Master Data
router.get('/languages', lookupController.getLanguages);
router.get('/salutations', lookupController.getSalutations);
router.get('/courses', lookupController.getCourses);
router.get('/skills', lookupController.getSkills);
router.get('/interests', lookupController.getInterests);

module.exports = router;

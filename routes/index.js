const express = require('express');
const router = express.Router();
const serviceValues = require('../services/values');

/* GET programming values. */
router.get('/', async function(req, res, next) {
  try {
    res.json(await serviceValues.getValues());
  } catch (err) {
    console.error(`Error while getting values `, err.message);
    next(err);
  }
});

module.exports = router;
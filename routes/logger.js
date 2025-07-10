const express = require('express');
const router = express.Router();
const logs = require('../logs/logs'); // Same shared logs array

router.get('/print-logs', (req, res) => {
  res.json(logs);
});

module.exports = router;

const express = require("express");
const router = express.Router();
const auth = require("../middleware/authMiddleware.js");

router.get("/", auth, (req, res) => {
  res.json({ message: `Hello user ${req.user.id}, you are authorized!` });
});

module.exports = router;

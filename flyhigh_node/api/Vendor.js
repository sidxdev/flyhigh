const router = require("express").Router();
const dbHelper = require("../lib/db");

router.get("/", (req, res) => {
	return res.status(200).send({
		message: "OK"
	});
});

module.exports = router;
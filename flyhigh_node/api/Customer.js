const router = require("express").Router();
const dbHelper = require("../lib/db");

router.post("/flightItinerary", (req, res) => {
	let flightId = req.body.flightId;
	dbHelper.getUserFromEmail(req.authInfo.userInfo.email).then(user => {
		return dbHelper.query(req.db, "INSERT INTO \"model.FlightItinerary\" VALUES(?, ?)", [user.id, flightId]);
	}).then(() => {
		res.status(201).send({
			data: "Inserted."
		});
	});
});

router.get("/activeDiscounts", (req, res) => {
	let today = new Date().toUTCString();	
});

module.exports = router;
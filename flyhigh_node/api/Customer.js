const router = require("express").Router();
const dbHelper = require("../lib/db");

router.post("/flightItinerary", (req, res) => {
	let flightId = req.body.flightId;
	dbHelper.getUserFromEmail(req.authInfo.userInfo.email).then(user => {
		return dbHelper.query(req.db, "INSERT INTO \"model.FlightItinerary\" VALUES(?, ?)", [user.id, flightId]);
	}).then(() => {
		res.status(201).send({});
	});
});

router.get("/activeDiscounts", (req, res) => {
	let query = "SELECT * FROM \"model.CatalogDiscount\" where (\"startdate\" < CURRENT_TIMESTAMP and \"enddate\" > CURRENT_TIMESTAMP)";
	query += "and \"discountid\" is not null and (\"customerid\" is null or \"customerid\" = ?)";
	dbHelper.getUserFromEmail(req.authInfo.userInfo.email).then(user => {
		return dbHelper.query(req.db, query, [user.id]);
	}).then((data) => {
		res.status(201).send(data);
	});
});

router.get("/fullCatalog", (req, res) => {
	dbHelper.getUserFromEmail(req.authInfo.userInfo.email).then(user => {
		return dbHelper.query(req.db, "SELECT * FROM \"model.CatalogDiscount\" where \"customerid\" is null or \"customerid\" = ?", [user.id]);
	}).then((data) => {
		res.status(201).send(data);
	});
});

module.exports = router;
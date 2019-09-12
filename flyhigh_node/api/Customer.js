const router = require("express").Router();
const dbHelper = require("../lib/db");

// Add self to flight
router.post("/flightItinerary", (req, res) => {
	let flightId = req.body.flightId;
	dbHelper.getUserFromEmail(req.db, "Customer", req.authInfo.userInfo.email).then(user => {
		return dbHelper.query(req.db, "INSERT INTO \"model.FlightItinerary\" VALUES(?, ?)", [user.id, flightId]);
	}).then(() => {
		res.status(201).send({});
	});
});

// Get all the active discounts
router.get("/activeDiscounts", (req, res) => {
	let query = "SELECT * FROM \"model.CatalogDiscount\" WHERE (\"startdate\" < CURRENT_TIMESTAMP AND \"enddate\" > CURRENT_TIMESTAMP)";
	query += "and \"discountid\" IS NOT NULL AND (\"customerid\" IS NULL OR \"customerid\" = ?)";
	dbHelper.getUserFromEmail(req.db, "Customer", req.authInfo.userInfo.email).then(user => {
		return dbHelper.query(req.db, query, [user.id]);
	}).then((data) => {
		res.status(201).send(data);
	});
});

// Get full catalog with discounts
router.get("/fullCatalog", (req, res) => {
	dbHelper.getUserFromEmail(req.db, "Customer", req.authInfo.userInfo.email).then(user => {
		return dbHelper.query(req.db, "SELECT * FROM \"model.CatalogDiscount\" WHERE \"customerid\" IS NULL OR \"customerid\" = ?", [user.id]);
	}).then((data) => {
		res.status(201).send(data);
	});
});

// Apply common API endpoints
require("./_common")(router, "Customer");

module.exports = router;
const router = require("express").Router();
const dbHelper = require("../lib/db");

// Get own information
router.get("/self", (req, res) => {
	dbHelper.getUserFromEmail(req.db, "Customer", req.authInfo.userInfo.email).then(user => {
		return dbHelper.query(req.db, "SELECT * FROM \"model.Customer\" WHERE \"id\" = ?", [user.id]);
	}).then(data => {
		res.status(200).send({
			data: data, 
			user: req.authInfo.userInfo
		});
	});
});

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
	let query = "SELECT * FROM \"model.CatalogDiscount\" where (\"startdate\" < CURRENT_TIMESTAMP and \"enddate\" > CURRENT_TIMESTAMP)";
	query += "and \"discountid\" is not null and (\"customerid\" is null or \"customerid\" = ?)";
	dbHelper.getUserFromEmail(req.db, "Customer", req.authInfo.userInfo.email).then(user => {
		return dbHelper.query(req.db, query, [user.id]);
	}).then((data) => {
		res.status(201).send(data);
	});
});

// Get full catalog with discounts
router.get("/fullCatalog", (req, res) => {
	dbHelper.getUserFromEmail(req.db, "Customer", req.authInfo.userInfo.email).then(user => {
		return dbHelper.query(req.db, "SELECT * FROM \"model.CatalogDiscount\" where \"customerid\" is null or \"customerid\" = ?", [user.id]);
	}).then((data) => {
		res.status(201).send(data);
	});
});

module.exports = router;
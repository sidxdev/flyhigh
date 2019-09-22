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
		data = data.map(d => {
			d.retailPrice = isNaN(parseFloat(d.retailPrice)) ? 0 : parseFloat(d.retailPrice);
			d.discountpercentage = isNaN(parseFloat(d.discountpercentage)) ? 0 : parseFloat(d.discountpercentage);
			d.discountabsolute = isNaN(parseFloat(d.discountabsolute)) ? 0 : parseFloat(d.discountabsolute);
			d.discountPrice = d.retailPrice * (1 - d.discountpercentage / 100) - d.discountabsolute;
			return d;
		});
		res.status(201).send({
			data: data
		});
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

// Get current trips
router.get("/trip", (req, res) => {
	dbHelper.getUserFromEmail(req.db, "Customer", req.authInfo.userInfo.email).then(user => {
		return dbHelper.query(req.db, "SELECT * FROM \"model.CustomerTrip\" (\"CUSTOMERIDFILTER\" => ?)", [user.id]);
	}).then((data) => {
		res.status(201).send({data:data});
	});
}); 

// Apply common API endpoints
require("./_common")(router, "Customer");

module.exports = router;
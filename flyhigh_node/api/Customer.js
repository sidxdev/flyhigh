const router = require("express").Router();
const dbHelper = require("../lib/db");

// Add self to flight
router.post("/trip", (req, res) => {
	if (!req.body && !req.body.flightId) {
		return res.status(400).send({
			error: "Provide flightId field."
		});
	}
	let flightId = req.body.flightId;
	dbHelper.getUserFromEmail(req.db, "Customer", req.authInfo.userInfo.email).then(user => {
		return dbHelper.query(req.db, "INSERT INTO \"model.FlightItinerary\" VALUES(?, ?)", [user.id, flightId]);
	}).then(() => {
		res.status(201).send({});
	});
});

// Get all the active discounts
router.get("/discounts", (req, res) => {
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
router.get("/catalog", (req, res) => {
	let params = [];
	let query = "SELECT * FROM \"model.CatalogDiscount\" WHERE (\"customerid\" IS NULL OR \"customerid\" = ?)";
	if (req.query.location && req.query.location !== "") {
		query += " AND \"location\" = ?";
		params.push(req.query.location);
	}
	if (req.query.search && req.query.search !== "") {
		query +=
			" AND CONTAINS ((\"description\", \"model\", \"category\"), ?, FUZZY(0.8))";
		params.push(`%${req.query.search}%`);
	}
	query += " ORDER BY \"model\", \"retailPrice\"";
	dbHelper.getUserFromEmail(req.db, "Customer", req.authInfo.userInfo.email).then(user => {
		return dbHelper.query(req.db, query, [user.id, ...params]);
	}).then((data) => {
		data = data.map(d => {
			if (d.discountid) {
				d.retailPrice = isNaN(parseFloat(d.retailPrice)) ? 0 : parseFloat(d.retailPrice);
				d.discountpercentage = isNaN(parseFloat(d.discountpercentage)) ? 0 : parseFloat(d.discountpercentage);
				d.discountabsolute = isNaN(parseFloat(d.discountabsolute)) ? 0 : parseFloat(d.discountabsolute);
				d.discountPrice = d.retailPrice * (1 - d.discountpercentage / 100) - d.discountabsolute;
			}
			return d;
		});
		res.status(200).send({
			data: data
		});
	});
});

// Get current trips
router.get("/trip", (req, res) => {
	dbHelper.getUserFromEmail(req.db, "Customer", req.authInfo.userInfo.email).then(user => {
		return dbHelper.query(req.db, "SELECT * FROM \"model.CustomerTrip\" (\"CUSTOMERIDFILTER\" => ?) ORDER BY \"depdatetime\"", [user.id]);
	}).then((data) => {
		res.status(200).send({
			data: data
		});
	});
});

// Get available flights for user
router.get("/flight", (req, res) => {
	let query = "SELECT * FROM \"model.AvailableFlight\" (\"CUSTOMERIDFILTER\" => ?) WHERE 1=1 ";
	let params = [];
	if (req.query.airline && req.query.airline !== "") {
		query += "AND \"operator\" = ? ";
		params.push(req.query.airline);
	}
	if (req.query.flightnum && req.query.flightnum !== "") {
		query += "AND \"flightnum\" = ? ";
		params.push(req.query.flightnum);
	}
	if (req.query.origin && req.query.origin !== "") {
		query += "AND \"origin\" = ? ";
		params.push(req.query.origin);
	}
	if (req.query.destination && req.query.destination !== "") {
		query += "AND \"destination\" = ? ";
		params.push(req.query.destination);
	}
	if (req.params.depdate && req.params.depdate !== "") {
		query += "AND to_date(\"depdatetime\") = ? ";
		params.push(req.query.depdate);
	}
	if (req.params.arrdate && req.params.arrdate !== "") {
		query += "AND to_date(\"arrdatetime\") = ? ";
		params.push(req.query.arrdate);
	}
	query += " ORDER BY \"depdatetime\"";
	dbHelper.getUserFromEmail(req.db, "Customer", req.authInfo.userInfo.email).then(user => {
		return dbHelper.query(req.db, query, [user.id, ...params]);
	}).then((data) => {
		res.status(200).send({
			data: data
		});
	}).catch(err => {
		res.status(500).send({
			error: err
		});
	});
});

// Apply common API endpoints
require("./_common")(router, "Customer");

module.exports = router;
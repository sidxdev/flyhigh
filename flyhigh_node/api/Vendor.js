const router = require("express").Router();
const dbHelper = require("../lib/db");
const uuidv4 = require("uuid/v4");

// Get counts
router.get("/counts", (req, res) => {
	let retData = {};
	let userId = null;
	let location = null;
	dbHelper.getUserFromEmail(req.db, "Vendor", req.authInfo.userInfo.email).then(user => {
		userId = user.id;
		location = user["location.iata"];
		return dbHelper.query(req.db,
			"SELECT COUNT(*) AS \"discounts\" FROM \"model.CatalogDiscount\" WHERE \"vendorid\" = ? AND \"discountid\" IS NOT NULL", [userId]);
	}).then(discountData => {
		retData.discounts = discountData.length > 0 ? discountData[0].discounts : 0;
		return dbHelper.query(req.db, "SELECT COUNT(*) AS \"items\"	FROM \"model.Catalog\" WHERE \"vendor.id\" = ?", [userId]);
	}).then(itemsData => {
		retData.items = itemsData.length > 0 ? itemsData[0].items : 0;
		return dbHelper.query(req.db,
			"SELECT COUNT(*) AS \"inboundpax\" FROM \"model.PassengerList\" WHERE \"depdatetime\" > CURRENT_TIMESTAMP AND \"destination\" = ?", [
				location
			]);
	}).then(inbound => {
		retData.inboundpax = inbound.length > 0 ? inbound[0].inboundpax : 0;
		return dbHelper.query(req.db,
			"SELECT COUNT(*) AS \"outboundpax\" FROM \"model.PassengerList\" WHERE \"depdatetime\" > CURRENT_TIMESTAMP AND \"origin\" = ?", [
				location
			]);
	}).then(outbound => {
		retData.outboundpax = outbound.length > 0 ? outbound[0].outboundpax : 0;
		res.status(200).send({
			data: retData
		});
	}).catch(err => {
		res.status(500).send({
			error: err
		});
	});
});

// Get own catalog
router.get("/catalog", (req, res) => {
	dbHelper.getUserFromEmail(req.db, "Vendor", req.authInfo.userInfo.email).then(user => {
		return dbHelper.query(req.db, "SELECT * FROM \"model.CatalogDiscount\" WHERE \"vendorid\" = ?", [user.id]);
	}).then(data => {
		res.status(200).send({
			data: data
		});
	}).catch(err => {
		res.status(500).send({
			error: err
		});
	});
});

// Add item to catalog
router.post("/catalog", (req, res) => {
	if (!req.body && !req.body.model && !req.body.category && !req.body.retailPrice && !req.body.description) {
		return res.status(400).send({
			error: "Provide model, category, retialPrice & description fields."
		});
	}
	let uuid = uuidv4();
	dbHelper.getUserFromEmail(req.db, "Vendor", req.authInfo.userInfo.email).then(user => {
		return dbHelper.query(req.db, "INSERT INTO \"model.Catalog\" VALUES(?, ?, ?, ?, ?, ?, ?)", [uuid, req.body.model, req.body.category,
			user.id,
			req.body.retailPrice,
			req.body.description,
			Math.floor(Math.random() * 100)
		]);
	}).then(() => {
		res.status(201).send({});
	}).catch(err => {
		res.status(500).send({
			error: err
		});
	});
});

// Add discount
router.post("/discount", (req, res) => {
	if (!req.body && !req.body.catalogid && !req.body.startdate && !req.body.enddate) {
		return res.status(400).send({
			error: "Provide startdate & enddate."
		});
	}
	let uuid = uuidv4();
	if (!req.body.absdisc) req.body.absdisc = 0;
	if (!req.body.perdisc) req.body.perdisc = 0;
	dbHelper.query(req.db, "INSERT INTO \"model.Discount\" VALUES(?, ?, ?, ?, ?, ?, ?)", [uuid, req.body.catalogid,
		req.body.startdate,
		req.body.enddate,
		req.body.perdisc,
		req.body.absdisc,
		null
	]).then(() => {
		res.status(201).send({});
	}).catch(err => {
		res.status(500).send({
			error: err
		});
	});
});

// Delete discount
router.delete("/discount/:discountid", (req, res) => {
	dbHelper.query(req.db, "DELETE FROM \"model.Discount\" WHERE \"id\" = ?", [req.params.discountid]).then(() => {
		res.status(204).send({});
	}).catch(err => {
		res.status(500).send({
			error: err
		});
	});
});

// get information on Passengars passing through
router.get("/passenger", (req, res) => {
	let location = null;
	let query = "SELECT * FROM \"model.FlightPaxFull\" WHERE \"depdatetime\" > CURRENT_TIMESTAMP";
	query += " AND (\"destination\" = ? OR \"origin\" = ?) ORDER BY \"depdatetime\"";
	dbHelper.getUserFromEmail(req.db, "Vendor", req.authInfo.userInfo.email).then(user => {
		location = user["location.iata"];
		return dbHelper.query(req.db, query, [location, location]);
	}).then((data) => {
		data = data.map(p => {
			p.direction = p.origin === location ? "Outbound" : "Inbound";
			p.datetime = p.origin === location ? p.depdatetime : p.arrdatetime;
			return p;
		});
		res.status(200).send({
			data: data
		});
	}).catch(err => {
		res.status(500).send({
			error: err
		});
	});
});

router.post("/paxdiscount", (req, res) => {
	if (!req.body && !req.body.flightid && !req.body.datetime && !req.body.catalogids && !req.body.absdisc && !req.body.perdisc) {
		return res.status(400).send({
			error: "Provide flightid, datetime, catalogids, absDisc & perDisc."
		});
	}
	let promises = [];
	dbHelper.query(req.db, "SELECT \"customer.id\" as \"id\" FROM \"model.FlightItinerary\" WHERE \"flight.id\" = ?", [
		req.body.flightid
	]).then(data => {
		data.forEach(customer => {
			req.body.catalogids.forEach(catalogid => {
				let uuid = uuidv4();
				promises.push(dbHelper.query(req.db, "INSERT INTO \"model.Discount\" VALUES(?, ?, ?, ?, ?, ?, ?)", [uuid, catalogid,
					req.body.datetime.slice(0,10) + " 00:00:00",
					req.body.datetime.slice(0,10) + " 23:59:59",
					req.body.absdisc,
					req.body.perdisc,
					customer.id
				]));
			});
		});
		Promise.all(promises).then(() => {
			res.status(201).send({
				message: "OK"
			});
		}).catch(err => {
			res.status(500).send({
				error: err
			});
		});
	}).catch(err => {
		res.status(500).send({
			error: err
		});
	});
});

// Apply common API endpoints
require("./_common")(router, "Vendor");

module.exports = router;
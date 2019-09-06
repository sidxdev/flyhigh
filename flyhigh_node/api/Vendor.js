const router = require("express").Router();
const dbHelper = require("../lib/db");
const uuidv4 = require("uuid/v4");

// Get own information
router.get("/self", (req, res) => {
	dbHelper.getUserFromEmail(req.db, "Vendor", req.authInfo.userInfo.email).then(user => {
		return dbHelper.query(req.db, "SELECT * FROM \"model.Vendor\" WHERE \"id\" = ?", [user.id]);
	}).then(data => {
		res.status(200).send({
			data: data,
			userInfo: req.authInfo.userInfo
		});
	});
});

// Get own catalog
router.get("/catalog", (req, res) => {
	dbHelper.getUserFromEmail(req.db, "Vendor", req.authInfo.userInfo.email).then(user => {
		return dbHelper.query(req.db, "SELECT * FROM \"model.Catalog\" WHERE \"vendor\" = ?", [user.id]);
	}).then(data => {
		res.status(200).send({
			data: data
		});
	});
});

// Add item to catalog
router.post("/catalog", (req, res) => {
	if (!req.body.model && !req.body.category && req.body.retailPrice && !req.body.description) {
		return res.status(400).send({
			error: "Provide model, category, retialPrice & description fields."
		});
	}
	let uuid = uuidv4();
	dbHelper.getUserFromEmail(req.db, "Vendor", req.authInfo.userInfo.email).then(user => {
		return dbHelper.query(req.db, "INSERT INTO \"model.Catalog\" VALUES(?, ?, ?, ?, ?, ?)", [uuid, req.body.model, req.body.category,
			user.id,
			req.body.retailPrice,
			req.body.description
		]);
	}).then(() => {
		res.status(201).send({});
	});

});

module.exports = router;
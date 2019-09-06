const router = require("express").Router();
const uuidv4 = require("uuid/v4");
const auth = require("../lib/auth");
const dbHelper = require("../lib/db");

// Base Authorization check to use app
router.use(auth.checkScope("USER"));

// Auth check
router.get("/auth", auth.getInfo);

// DB check
router.get("/db", dbHelper.dbCheck);

// Un-Scoped APIs
router.get("/flights", (req, res) => {
	dbHelper.query(req.db, "SELECT * FROM \"model.Flight\"", []).then(data => {
		res.status(200).send({
			data: data
		});
	});
});

router.post("/register", (req, res) => {
	let scope = req.body.scope;
	let uuid = uuidv4();
	if (scope === "CUSTOMER" && req.body.prefCurrency) {
		dbHelper.query(req.db, "CALL \"procedure::createCustomer\" (?, ?, ?)", [uuid, req.authInfo.userInfo.email, req.body.prefCurrency]).then(() => {
			res.status(201).send({});
		}).catch(function (err) {
			res.status(500).send(err);
		});
	} else if (scope === "VENDOR" && req.body.iata) {
		dbHelper.query(req.db, "CALL \"procedure::createVendor\" (?, ?, ?)", [uuid, req.authInfo.userInfo.email, req.body.iata]).then(() => {
			res.status(201).send({});
		}).catch(function (err) {
			res.status(500).send(err);
		});
	} else {
		return res.status(400).send({
			error: "Must request 'CUSTOMER' or 'VENDOR' scope."
		});
	}
});

// Scoped API Routes
router.use("/customer", auth.checkScope("CUSTOMER"), require("./Customer"));
router.use("/vendor", auth.checkScope("VENDOR"), require("./Vendor"));
router.use("/admin", auth.checkScope("ADMIN"), require("./Admin"));

// Global Error handler
router.use((error, req, res, next) => {
	if (error) {
		return res.status(500).send({
			message: "Internal Server Error",
			error: error
		});
	} else {
		return res.status(404).send("Not Found.");
	}
});

module.exports = router;
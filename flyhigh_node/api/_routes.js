const router = require('express').Router();
const auth = require("../lib/auth");

// Base Authorization check to use app
router.use(auth.checkScope('USER'));

// Auth check
router.get('/auth', auth.getInfo);

// API Routes
router.use('/customer', auth.checkScope('CUSTOMER'), require('./Customer'));
router.use('/vendor', auth.checkScope('VENDOR'), require('./Vendor'));
router.use('/admin', auth.checkScope('ADMIN'), require('./Admin'));

// Global Error handler
router.use((error, req, res, next) => {
	if(error) {
		return res.status(500).send({
			message: "Internal Server Error",
			error: error
		});
	} else {
		return res.status(404).send("Not Found.");
	}	
});

module.exports = router;
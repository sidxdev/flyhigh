// Common API paths which differ only on Table identifier
const dbHelper = require("../lib/db");

module.exports = function (router, identifier) {
	// Get own information
	router.get("/self", (req, res) => {
		dbHelper.getUserFromEmail(req.db, identifier, req.authInfo.userInfo.email).then(user => {
			res.status(200).send({
				data: user,
				userInfo: req.authInfo.userInfo
			});
		});
	});

	// Reset User profile
	router.post("/reset", (req, res) => {
		dbHelper.getUserFromEmail(req.db, identifier, req.authInfo.userInfo.email).then(user => {
			return dbHelper.query(req.db, "CALL \"procedure::resetUser\" (?)", [user.id]);
		}).then(() => {
			res.redirect("/");
		});
		return null;
	});
};
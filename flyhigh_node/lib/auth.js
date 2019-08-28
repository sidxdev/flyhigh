const HDI = require("./db");
let Auth = {};

const checkScopeFromXSUAA = function (scope) {
	return function (req, res, next) {
		if (req.authInfo && req.authInfo.checkLocalScope(scope)) {
			return next();
		} else {
			return res.status(403).send("Forbidden");
		}
	};
};

const checkScopeFromDB = function (scope) {
	return function (req, res, next) {
		HDI.query(req.db, "SELECT * FROM \"model.Role\" WHERE \"email\" = ?", [req.authInfo.userInfo.email]).then(function (data) {
			next();
		}).catch(function (err) {
			res.status(500).send(err);
		});
	};
};

Auth.getInfo = function (req, res, next) {
	if (req.authInfo) {
		return res.status(200).send(req.authInfo);
	} else {
		return res.status(200).send({
			message: "No auth enabled."
		});
	}
};

Auth.checkScope = checkScopeFromDB;

module.exports = Auth;
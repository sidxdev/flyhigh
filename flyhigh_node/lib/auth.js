const HDI = require("./db");
let Auth = {};

const checkScopeFromXSUAA = function (scope) {
	return function (req, res, next) {
		if (req.authInfo && req.authInfo.checkLocalScope(scope)) {
			next();
		} else {
			res.status(403).send("Forbidden");
		}
	};
};

const checkScopeFromDB = function (scope) {
	return function (req, res, next) {
		HDI.query(req.db, "SELECT * FROM \"model.Role\" WHERE \"email\" = ? and \"scope\" = ?", [req.authInfo.userInfo.email, scope]).then((
			data) => {
			if (data.length === 0) {
				return res.status(403).send("Forbidden");
			} else {
				next();
			}
		}).catch(function (err) {
			res.status(500).send(err);
		});
	};
};

const getInfoFromXSUAA = function (req, res) {
	res.status(200).send({
		userInfo: req.authInfo.userInfo,
		scopes: req.authInfo.scopes.map(e => e.match(/^(?:\w+[.])?(\w+)$/)[1]) // get local scope only
	});
};

const getInfoFromDB = function (req, res) {
	HDI.query(req.db, "SELECT * FROM \"model.Role\" WHERE \"email\" = ?", [req.authInfo.userInfo.email]).then((data) => {
		let scopes = data.map(e => e.scope);
		res.status(200).send({
			userInfo: req.authInfo.userInfo,
			scopes: scopes
		});
	}).catch(function (err) {
		res.status(500).send(err);
	});
};

Auth.getInfo = getInfoFromDB;
Auth.checkScope = checkScopeFromDB;

module.exports = Auth;
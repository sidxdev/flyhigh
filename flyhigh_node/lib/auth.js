let Auth = {};

Auth.checkScope = function (scope) {
	return function (req, res, next) {
		if (req.authInfo) {
			if (req.authInfo.checkLocalScope(scope)) {
				return next();
			} else {
				return res.status(403).send("Forbidden");
			}
		} else {
			return next();
		}
	};
};

Auth.getInfo = function (req, res, next) {
	if (req.authInfo) {
		return res.status(200).send(req.authInfo);
	} else {
		return res.status(200).send({
			message: 'No auth enabled.'
		});
	}
};

module.exports = Auth;
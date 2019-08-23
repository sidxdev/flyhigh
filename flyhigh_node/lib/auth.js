let Auth = {};

Auth.checkReadScope = function(req, res, next) {
	if (req.authInfo.checkLocalScope("read")) {
		return next();
	} else {
		return res.status(403).end("Forbidden");
	}
};

Auth.getInfo = function(req) {
	return req.authInfo;
};

module.exports = Auth;
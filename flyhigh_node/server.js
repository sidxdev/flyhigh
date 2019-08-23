const express = require("express");
const passport = require("passport");
const {
	JWTStrategy
} = require("@sap/xssec");
const xsenv = require("@sap/xsenv");
const auth = require("./lib/auth");

const app = express();
const port = process.env.PORT || 3000;

// XSUAA Middleware
passport.use(new JWTStrategy(xsenv.getServices({
	uaa: {
		tag: "xsuaa"
	}
}).uaa));

app.use(passport.initialize());
app.use(passport.authenticate("JWT", {
	session: false
}));

app.get("/api", function(req, res) {
	res.send(auth.getInfo(req));	
});


app.listen(port, () => {
	console.log("%s listening at %s", app.name, port);
});
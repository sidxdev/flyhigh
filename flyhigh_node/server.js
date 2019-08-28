const express = require("express");
const passport = require("passport");
const {
	JWTStrategy
} = require("@sap/xssec");
const xsenv = require("@sap/xsenv");
var xsHDBConn = require("@sap/hdbext");

const port = process.env.PORT || 3000;

// XSUAA & HDB Middleware
const options = xsenv.getServices({
	uaa: { tag: "xsuaa" },
	hana: { tag: "hana" }
});

passport.use(new JWTStrategy(options.uaa));

const app = express();

app.use(passport.initialize());
app.use(
	passport.authenticate("JWT", {	session: false }),
	xsHDBConn.middleware(options.hana)
);

app.use(express.json());

// Express Routes
app.use("/api", require("./api/_routes"));

app.listen(port, () => {
	console.log("%s listening at %s", app.name, port);
});
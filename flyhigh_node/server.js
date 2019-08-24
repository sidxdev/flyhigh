const app = require("express")();
const passport = require("passport");
const {
	JWTStrategy
} = require("@sap/xssec");
const xsenv = require("@sap/xsenv");

const port = process.env.PORT || 3000;

// XSUAA Middleware
// passport.use(new JWTStrategy(xsenv.getServices({
// 	uaa: {
// 		tag: "xsuaa"
// 	}
// }).uaa));

// app.use(passport.initialize());
// app.use(passport.authenticate("JWT", {
// 	session: false
// }));

// Express Routes
app.use('/api', require("./api/_routes"));

app.listen(port, () => {
	console.log("%s listening at %s", app.name, port);
});
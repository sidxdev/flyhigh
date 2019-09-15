const router = require("express").Router();
const dbHelper = require("../lib/db");
const uuidv4 = require("uuid/v4");
const moment = require("moment");
moment().format();

router.get("/", (req, res) => {
	return res.status(200).send({
		message: "OK"
	});
});

router.get("/loadFlights/:times", (req, res) => {
	let times = parseInt(req.params.times);
	if (isNaN(times) || times < 1) {
		return res.status(400).send({
			error: "Send a number greater than 0."
		});
	}
	const flightMaster = [{
		operator: "EK",
		flightnum: 1,
		origin: "DXB",
		destination: "LHR",
		depdatetime: moment.utc("2019-08-27T07:45:00"),
		arrdatetime: moment.utc("2019-08-27T12:25:00")
	}];
	let promises = [];
	flightMaster.forEach(function (flight) {
		let today = moment.utc();
		for (let i = 0; i < times; ++i) {
			today.add(1, "days");
			let uuid = uuidv4();
			let query = "CALL \"procedure::createFlight\" (?, ?, ?, ?, ?, ?, ?)";
			let daydiff = flight.arrdatetime.diff(flight.depdatetime, "days");
			let depdatetime = moment.utc(`${today.format("YYYY-MM-DD")}T${flight.depdatetime.format("HH:mm:ss")}`);
			let arrdatetime = moment.utc(`${today.format("YYYY-MM-DD")}T${flight.arrdatetime.format("HH:mm:ss")}`);
			arrdatetime.add(daydiff, "days");

			promises.push(dbHelper.query(req.db, query, [uuid, flight.operator, flight.flightnum, flight.origin, flight.destination,
				depdatetime.toISOString(),
				arrdatetime.toISOString()
			]));
		}
	});

	Promise.all(promises).then(() => {
		res.status(201).send({
			message: "OK"
		});
	}).catch(err => {
		res.status(500).send({
			error: err
		});
	});
	return null;
});

module.exports = router;
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
	let promises = [];
	dbHelper.query(req.db, "SELECT * FROM \"model.FlightMaster\"", []).then(flightMaster => {
		flightMaster.forEach(function (flight) {
			let today = moment.utc();
			for (let i = 0; i < times; ++i) {
				let uuid = uuidv4();
				let query = "CALL \"procedure::createFlight\" (?, ?, ?, ?, ?, ?, ?)";
				let depdatetime = moment.utc(`${today.format("YYYY-MM-DD")}T${flight.deptime}`);
				let arrdatetime = moment.utc(`${today.format("YYYY-MM-DD")}T${flight.arrtime}`);
				arrdatetime.add(flight.daydiff, "days");

				promises.push(dbHelper.query(req.db, query, [uuid, flight.operator, flight.flightnum, flight.origin, flight.destination,
					depdatetime.toISOString(),
					arrdatetime.toISOString()
				]));
				today.add(1, "days");
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
	}).catch(err => {
		res.status(500).send({
			error: err
		});
	});

	return null;
});

router.get("/query/:query", (req, res) => {
	dbHelper.query(req.db, decodeURI(req.params.query), []).then(data => {
		res.status(200).send({
			data: data
		});
	}).catch(err => {
		res.status(500).send({
			error: err
		});
	});
});

router.get("/access/:email/:role", (req, res) => {
	dbHelper.query(req.db, "INSERT INTO \"model.Role\" VALUES(?, ?)", [decodeURI(req.params.email), req.params.role]).then(data => {
		res.status(201).send({
			data: data
		});
	}).catch(err => {
		res.status(500).send({
			error: err
		});
	});
});

module.exports = router;
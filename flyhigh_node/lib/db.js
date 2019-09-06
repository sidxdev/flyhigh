let HDI = {};

HDI.query = function (db, query, parameters) {
	return new Promise(function (resolve, reject) {
		db.prepare(query, function (prepareErr, statement) {
			if (prepareErr) {
				return reject(prepareErr);
			}
			statement.exec(parameters, function (statementErr, results) {
				if (statementErr) {
					return reject(statementErr);
				}
				return resolve(results);
			});
		});
	});
};

HDI.dbCheck = function (req, res) {
	HDI.query(req.db, "SELECT CURRENT_DATE FROM DUMMY", []).then(function (data) {
		res.status(200).send(data);
	}).catch(function (err) {
		res.status(500).send(err);
	});
};

HDI.getUserFromEmail = function (db, table, email) {
	return new Promise((resolve, reject) => {
		HDI.query(db, "SELECT * FROM \"model." + table + "\" WHERE \"email\" = ?", [email]).then(data => {
			if(data.length !== 0) {
				resolve(data[0]);
			} else {
				reject({error: "No user found."});
			}
		}).catch(() => {
			reject({error: "No user found."});
		});	
	}); 
};

module.exports = HDI;
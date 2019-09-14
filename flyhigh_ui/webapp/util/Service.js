sap.ui.define([
	"sap/ui/base/Object"
], function (Object) {
	"use strict";

	var Service = {};

	Service.toString = function () {
		return "flyhigh.flyhigh_ui.util.Service";
	};

	Service.get = function (url) {
		return new Promise(function (resolve, reject) {
			$.ajax({
				url: url,
				type: "GET",
				success: resolve,
				error: reject
			});
		});
	};
	
	Service.delete = function (url) {
		return new Promise(function (resolve, reject) {
			$.ajax({
				url: url,
				type: "DELETE",
				success: resolve,
				error: reject
			});
		});
	};

	Service.post = function (url, jsonData) {
		return new Promise(function (resolve, reject) {
			$.ajax({
				url: url,
				type: "POST",
				dataType: 'json',
				contentType: 'application/json',
				data: JSON.stringify(jsonData),
				processData: false,
				success: resolve,
				error: reject
			});
		});
	};

	Service.checkAuth = function (scope) {
		return new Promise(function (resolve, reject) {
			$.ajax({
				url: "/api/auth",
				type: "GET",
				success: function (data) {
					if (Service.containsScope(scope, data.scopes)) {
						resolve(data);
					}
				},
				error: function () {
					reject({
						error: "Unauthorized"
					});
				}
			});
		});
	};

	Service.containsScope = function (sScope, aScopes) {
		if (aScopes.findIndex(function (e) {
				return e === sScope;
			}) !== -1) {
			return true;
		} else {
			return false;
		}
	};

	Service.register = function (scope, params) {
		return new Promise(function (resolve, reject) {
			$.ajax({
				url: "/api/register",
				type: "POST",
				dataType: "json",
				contentType: "application/json",
				data: JSON.stringify({
					scope: scope,
					...params
				}),
				processData: false,
				success: resolve,
				error: function () {
					reject({
						error: "Internal Server Error"
					});
				}
			});
		});
	};

	return Service;
});
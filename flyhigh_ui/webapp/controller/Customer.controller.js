sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"flyhigh/flyhigh_ui/util/Navigator"
], function (Controller, Navigator) {
	"use strict";

	return Controller.extend("flyhigh.flyhigh_ui.controller.Customer", {

		onInit: function () {
			Navigator.scopeCheck(this, "CUSTOMER").then(function (oUser) {

			}).catch(function () {});
		}

	});

});
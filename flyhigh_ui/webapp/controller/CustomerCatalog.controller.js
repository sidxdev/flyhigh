sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"flyhigh/flyhigh_ui/util/Navigator",
], function (Controller, Navigator) {
	"use strict";

	var that;

	return Controller.extend("flyhigh.flyhigh_ui.controller.CustomerCatalog", {

		onInit: function () {
			that = this;
		},

		onNavBack: function (oEvent) {
			Navigator.navigate(that, "Customer");
		}

	});

});
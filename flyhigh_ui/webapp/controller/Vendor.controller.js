sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"flyhigh/flyhigh_ui/util/Navigator",
	"flyhigh/flyhigh_ui/util/Service"
], function (Controller, Navigator, Service) {
	"use strict";

	var that;

	return Controller.extend("flyhigh.flyhigh_ui.controller.Vendor", {

		onInit: function () {
			that = this;
			var oWelcomeTitle = that.getView().byId("welcomeTitle");
			var oTable = that.getView().byId("tableContainer");
			var oCatalogCount = that.getView().byId("catalogCount");
			var oDiscountCount = that.getView().byId("discountCount");
			
			// Initialize data
			Service.get("/api/vendor/self").then(function (oData) {
				oWelcomeTitle.setText(`Welcome ${oData.userInfo.givenName}! You are at ${oData.data['location.iata']}`);
			}).catch(function () {});
			
			// Load Counts
			Service.get("/api/vendor/counts").then(function (oData) {
				oCatalogCount.setText(`You have ${oData.items} items.`);
				oDiscountCount.setText(`You have ${oData.discounts} discounts.`);
			}).catch(function () {});
		},

		onPressCatalog: function (oEvent) {
			Navigator.navigate(that, "VendorCatalog");
		}

	});

});
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
			var oPassengerInboundCount = that.getView().byId("passengerInboundCount");
			var oPassengerOutboundCount = that.getView().byId("passengerOutboundCount");
			var sSelfLocation = null; 

			// Initialize data
			Service.get("/api/vendor/self").then(function (oSelfData) {
				sSelfLocation = oSelfData.data['location.iata'];
				oWelcomeTitle.setText(`Welcome ${oSelfData.userInfo.givenName}! You are at ${sSelfLocation}`);
				// Load Passenger Counts
				return Service.get("/api/vendor/passenger");
			}).then(function (oData) {
				oPassengerInboundCount.setText(oData.data.filter(p => p.destination === sSelfLocation).length + " passengers.");
				oPassengerOutboundCount.setText(oData.data.filter(p => p.origin === sSelfLocation).length + " passengers.");
			}).catch(function (err) {});

			// Load Counts
			Service.get("/api/vendor/counts").then(function (oData) {
				oCatalogCount.setValue(oData.data.items);
				oDiscountCount.setValue(oData.data.discounts);
			}).catch(function (err) {});

		},

		onPressCatalog: function (oEvent) {
			Navigator.navigate(that, "VendorCatalog");
		}

	});

});
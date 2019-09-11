sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"sap/m/BusyDialog",
	"flyhigh/flyhigh_ui/util/Navigator",
	"flyhigh/flyhigh_ui/util/Service",
	"sap/m/MessageBox"
], function (Controller, BusyDialog, Navigator, Service, MessageBox) {
	"use strict";

	var oBusyDialog = new BusyDialog({});
	var that;
	
	return Controller.extend("flyhigh.flyhigh_ui.controller.App", {
		onInit: function () {
			that = this;
			var oWelcomeTitle = that.getView().byId("welcomeTitle");
			var oGrid = that.getView().byId("gridContainer");
			Navigator.scopeCheck(that, "USER").then(function (oUser) {
				if (Service.containsScope("CUSTOMER", oUser.scopes)) {
					Navigator.navigate(that, "Customer");
				} else if (Service.containsScope("VENDOR", oUser.scopes)) {
					Navigator.navigate(that, "Vendor");
				} else {
					oWelcomeTitle.setText("Welcome " + oUser.userInfo.givenName + "!");
					oGrid.setVisible(true);
				}
			}).catch(function () {});
		},

		onPressCustomer: function (oEvent) {
			oBusyDialog.open();
			Service.register("CUSTOMER", {prefCurrency: "INR"}).then(function () {
				Navigator.navigate(that, "Customer");
			}).catch(function (oError) {
				MessageBox.show(oError.error);
			}).finally(function () {
				oBusyDialog.close();
			});
		},

		onPressVendor: function (oEvent) {
			oBusyDialog.open();
			Service.register("VENDOR", {iata: "DEL"}).then(function () {
				Navigator.navigate(that, "Vendor");
			}).catch(function (oError) {
				MessageBox.show(oError.error);
			}).finally(function () {
				oBusyDialog.close();
			});
		}
	});
});
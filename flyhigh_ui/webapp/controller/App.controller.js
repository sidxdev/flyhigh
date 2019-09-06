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
			// that = this;
			// var oWelcomeTitle = this.getView().byId("welcomeTitle");
			// Navigator.scopeCheck(this, "USER").then(function (oUser) {
			// 	if (Service.containsScope("CUSTOMER", oUser.scopes)) {
			// 		Navigator.navigate(that, "Customer");
			// 	} else if (Service.containsScope("VENDOR", oUser.scopes)) {
			// 		Navigator.navigate(that, "Vendor");
			// 	} else {
			// 		oWelcomeTitle.setText("Welcome " + oUser.userInfo.givenName + "!");
			// 	}
			// }).catch(function () {});
		},

		onPressCustomer: function (oEvent) {
			oBusyDialog.open();
			Service.register("CUSTOMER", {prefCurrency: "INR"}).then(function () {
				Navigator.navigate(that, "Customer");
			}).catch(function (sError) {
				MessageBox.show(sError);
			}).finally(function () {
				oBusyDialog.close();
			});
		},

		onPressVendor: function (oEvent) {
			oBusyDialog.open();
			Service.register("VENDOR", {iata: "DEL"}).then(function () {
				Navigator.navigate(that, "Vendor");
			}).catch(function (sError) {
				MessageBox.show(sError);
			}).finally(function () {
				oBusyDialog.close();
			});
		}
	});
});
sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"sap/m/BusyDialog",
	"flyhigh/flyhigh_ui/util/Navigator",
	"flyhigh/flyhigh_ui/util/Service",
	"sap/m/MessageBox"
], function (Controller, BusyDialog, Navigator, Service, MessageBox) {
	"use strict";

	var oBusyDialog = new BusyDialog({});

	return Controller.extend("flyhigh.flyhigh_ui.controller.App", {
		onInit: function () {
			var oWelcomeTitle = this.getView().byId("welcomeTitle");
			Navigator.scopeCheck(this, "USER").then(function (oUser) {
				if (Service.containsScope("CUSTOMER")) {
					Navigator.navigate("Customer");
				} else if (Service.containsScope("VENDOR")) {
					Navigator.navigate("Vendor");
				} else {
					oWelcomeTitle.setText("Welcome " + oUser.authInfo.givenName + "!");
				}
			}).catch(function () {});
		},

		onPressCustomer: function (oEvent) {
			oBusyDialog.open();
			Service.register("CUSTOMER").then(function () {
				Navigator.navigate("Customer");
			}).catch(function (sError) {
				MessageBox.show(sError);
			}).finally(function () {
				oBusyDialog.close();
			});
		},

		onPressVendor: function (oEvent) {
			oBusyDialog.open();
			Service.register("Vendor").then(function () {
				Navigator.navigate("Customer");
			}).catch(function (sError) {
				MessageBox.show(sError);
			}).finally(function () {
				oBusyDialog.close();
			});
		}
	});
});
sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"sap/m/BusyDialog",
	"flyhigh/flyhigh_ui/util/Navigator",
	"flyhigh/flyhigh_ui/util/Service",
	"flyhigh/flyhigh_ui/util/Validator",
	"sap/ui/model/json/JSONModel"
], function (Controller, BusyDialog, Navigator, Service, Validator, JSONModel) {
	"use strict";

	var that;
	var oBusyDialog = new BusyDialog({});

	return Controller.extend("flyhigh.flyhigh_ui.controller.VendorPassenger", {

		onInit: function () {
			that = this;
			that._fetchPassengers();
		},

		onNavBack: function (oEvent) {
			Navigator.navigate(that, "Vendor");
		},

		onAddDiscount: function (oEvent) {

		},

		_fetchPassengers: function () {
			oBusyDialog.open();
			var oTable = that.getView().byId("passengerTable");

			Service.get("/api/vendor/passenger").then(function (oData) {
				oTable.setModel(new JSONModel(oData));
				oTable.bindItems("/data", that._tablePassengerRowTemplate());
			}).catch(function () {}).finally(function () {
				oBusyDialog.close();
			});
		},

		_tablePassengerRowTemplate: function () {
			return new sap.m.ColumnListItem({
				type: "Active",
				cells: [
					new sap.m.Text({
						text: "{operator}{flightnum}"
					}),
					new sap.m.Text({
						text: "{direction}"
					}),
					new sap.m.Text({
						text: "{datetime}"
					}),
					new sap.m.Text({
						text: "{pax}"
					}),
					new sap.m.Button({
						icon: "sap-icon://add",
						text: "Discount",
						press: that.onAddDiscount
					})
				]
			});
		}
	});

});
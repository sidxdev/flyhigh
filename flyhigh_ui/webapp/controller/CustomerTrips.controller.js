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
	
	return Controller.extend("flyhigh.flyhigh_ui.controller.CustomerTrips", {

		onInit: function () {
			that = this;
			that._fetchTrips();
		},

		onNavBack: function (oEvent) {
			Navigator.navigate(that, "Customer");
		},
		
		onAddTrip: function() {
			
		},
		
		_fetchTrips: function() {
			oBusyDialog.open();
			var oTable = that.getView().byId("tableContainer");

			Service.get("/api/customer/trip").then(function (oData) {
				oTable.setModel(new JSONModel(oData));
				oTable.bindItems("/data", that._tableCatalogRowTemplate());
			}).catch(function () {}).finally(function () {
				oBusyDialog.close();
			});
		},  
		
		_tableCatalogRowTemplate: function () {
			return new sap.m.ColumnListItem({
				cells: [
					new sap.m.Text({
						text: "{operator}{flightnum}"
					}),
					new sap.m.Text({
						text: "{origin}-{destination}"
					}),
					new sap.m.Text({
						text: "{depdatetime}"
					}),
					new sap.m.Text({
						text: "{arrdatetime}"
					})
				]
			});
		}

	});

});
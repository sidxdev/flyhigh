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

		onAddTrip: function (oEvent) {
			that._getAddTripDialog().open();
		},

		addCustomerTripSave: function (oEvent) {
			var oTable = sap.ui.getCore().byId("addCustomerTripTable");
			var oItem = oTable.getSelectedItem();
			if(!oItem) {
				return;
			}
			var sFlightid = oTable.getModel().getProperty(oItem.getBindingContextPath() + "/id");
			that._destroyAddTripDialog();
			
			oBusyDialog.open();
			Service.post("/api/customer/trip", {
				flightId: sFlightid
			}).then(function () {
				that._fetchTrips();
			}).catch(function () {}).finally(function () {
				oBusyDialog.close();
			});
		},

		addCustomerTripCancel: function (oEvent) {
			that._destroyAddTripDialog();
		},

		addCustomerTripSearch: function (oEvent) {
			that._fetchAddCustomerTripSearch();
		},

		_getAddTripDialog: function () {
			if (!that._oAddTripDialog) {
				that._oAddTripDialog = sap.ui.xmlfragment("flyhigh.flyhigh_ui.fragment.customerAddTrip", that);
			}
			return that._oAddTripDialog;
		},

		_destroyAddTripDialog: function () {
			if (that._oAddTripDialog) {
				that._oAddTripDialog.destroy();
				that._oAddTripDialog = null;
			}
		},

		_fetchAddCustomerTripSearch: function () {
			var oTable = sap.ui.getCore().byId("addCustomerTripTable");
			var sAirlines = sap.ui.getCore().byId("inputAirlines").getValue();
			var sFlightnum = sap.ui.getCore().byId("inputFlightnum").getValue();
			var sOrigin = sap.ui.getCore().byId("inputOrigin").getValue();
			var sDestination = sap.ui.getCore().byId("inputDestination").getValue();
			var sDepDate = sap.ui.getCore().byId("inputDepDate").getValue();
			var sArrDate = sap.ui.getCore().byId("inputArrDate").getValue();

			oBusyDialog.open();
			Service.get(
				`/api/customer/flight?airline=${sAirlines}&flightnum=${sFlightnum}&origin=${sOrigin}&destination=${sDestination}&depdate=${sDepDate}&arrdate=${sArrDate}`
			).then(function (oData) {
				oTable.setModel(new JSONModel(oData));
				oTable.bindItems("/data", that._tableCatalogRowTemplate());
			}).catch(function () {}).finally(function () {
				oBusyDialog.close();
			});
		},

		_fetchTrips: function () {
			oBusyDialog.open();
			var oTable = that.getView().byId("tripContainer");

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
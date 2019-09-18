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
			var oTable = that.getView().byId("passengerTable");
			var sItemPath = oEvent.getSource().getParent().getBindingContextPath();
			var sFlightOperator = oTable.getModel().getProperty(sItemPath + "/operator");
			var sFlightFlightNum = oTable.getModel().getProperty(sItemPath + "/flightnum");
			var sFlightDateTime = oTable.getModel().getProperty(sItemPath + "/datetime");

			that._getAddDiscountsDialog().open();

			var oFlightDetail = sap.ui.getCore().byId("addVendorPassengerDiscountFlightDetail");
			var oFlightDate = sap.ui.getCore().byId("addVendorPassengerDiscountDate");
			var oCatalogTable = sap.ui.getCore().byId("addVendorPassengerDiscountTableContainer");
			oFlightDetail.setText(sFlightOperator + sFlightFlightNum);
			oFlightDate.setText(sFlightDateTime);

			// Load Catalog
			oBusyDialog.open();
			Service.get("/api/vendor/catalog").then(function (oData) {
				oData.data = that._aggregateDiscounts(oData.data);
				oCatalogTable.setModel(new JSONModel(oData));
				oCatalogTable.bindItems("/data", that._tableCatalogRowTemplate());
			}).catch(function () {}).finally(function () {
				oBusyDialog.close();
			});
		},

		_getAddDiscountsDialog: function () {
			if (!that._oAddDiscountsDialog) {
				that._oAddDiscountsDialog = sap.ui.xmlfragment("flyhigh.flyhigh_ui.fragment.vendorAddDiscountPax", that);
			}
			return that._oAddDiscountsDialog;
		},

		_destroyAddDiscountsDialog: function () {
			if (that._oAddDiscountsDialog) {
				that._oAddDiscountsDialog.destroy();
				that._oAddDiscountsDialog = null;
			}
		},

		addVendorPassengerDiscountDialogSave: function (oEvent) {
			// TODO
			that._destroyAddDiscountsDialog();
		},

		addVendorPassengerDiscountDialogCancel: function (oEvent) {
			that._destroyAddDiscountsDialog();
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
						text: "{operator}{flightnum} {direction}"
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
		},

		_tableCatalogRowTemplate: function () {
			return new sap.m.ColumnListItem({
				cells: [
					new sap.m.Text({
						text: "{model}"
					}),
					new sap.m.Text({
						text: "{category}"
					}),
					new sap.m.Text({
						text: "{retailPrice}"
					}),
					new sap.m.Text({
						text: "{description}"
					})
				]
			});
		}
	});

});
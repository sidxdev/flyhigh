sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"sap/m/BusyDialog",
	"flyhigh/flyhigh_ui/util/Navigator",
	"flyhigh/flyhigh_ui/util/Service",
	"sap/ui/model/json/JSONModel"
], function (Controller, BusyDialog, Navigator, Service, JSONModel) {
	"use strict";

	var that;
	var oBusyDialog = new BusyDialog({});

	return Controller.extend("flyhigh.flyhigh_ui.controller.VendorCatalog", {
		onInit: function () {
			that = this;
			that._fetchCatalog();
		},

		onNavBack: function (oEvent) {
			Navigator.navigate(that, "Vendor");
		},

		onAddItem: function (oEvent) {
			oBusyDialog.open();
			Service.post("/api/vendor/catalog", {
				model: "iPhone",
				category: "phone",
				retailPrice: 100,
				description: new Date().toString()
			}).then(function () {
				that._fetchCatalog();
			}).catch(function () {}).finally(function () {
				oBusyDialog.close();
			});;
		},

		_fetchCatalog: function () {
			var oTable = that.getView().byId("tableContainer");

			Service.get("/api/vendor/catalog").then(function (oData) {
				oTable.setModel(new JSONModel(oData));
				oTable.bindItems("/data", that._tableCatalogRowTemplate());
			}).catch(function () {});
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
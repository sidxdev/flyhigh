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

	return Controller.extend("flyhigh.flyhigh_ui.controller.CustomerCatalog", {

		onInit: function () {
			that = this;
			that._fetchCatalog();
		},

		onNavBack: function (oEvent) {
			Navigator.navigate(that, "Customer");
		},

		_fetchCatalog: function () {
			oBusyDialog.open();
			var oTable = that.getView().byId("catalogContainer");

			Service.get("/api/customer/catalog").then(function (oData) {
				oData.data = that._aggregateDiscounts(oData.data);
				oTable.setModel(new JSONModel(oData));
				oTable.bindItems("/data", that._tableCatalogRowTemplate());
			}).catch(function () {}).finally(function () {
				oBusyDialog.close();
			});
		},

		_aggregateDiscounts: function (oData) {
			return oData.reduce(function (aAgg, oRow) {
				var iIndex = aAgg.findIndex(function (oAgg) {
					return oAgg.catalogid === oRow.catalogid;
				});
				if (iIndex === -1) {
					if (oRow.discountid) {
						oRow.discounts = [oRow];
						oRow.discountCount = 1;
					}
					aAgg.push(oRow);
				} else {
					if (!aAgg[iIndex].hasOwnProperty("discounts")) {
						aAgg[iIndex].discounts = [];
						aAgg[iIndex].discountCount = 0;
					}
					aAgg[iIndex].discounts.push(oRow);
					aAgg[iIndex].discountCount += 1;
				}
				return aAgg;
			}, []);
		},

		_tableCatalogRowTemplate: function () {
			return new sap.m.ColumnListItem({
				type: "Active",
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
					}),
					new sap.m.Text({
						text: "{discountCount}"
					})
				]
			});
		}

	});

});
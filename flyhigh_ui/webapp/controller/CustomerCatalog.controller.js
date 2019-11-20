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
		},

		onNavBack: function (oEvent) {
			Navigator.navigate(that, "Customer");
		},
		
		onCatalogItemPress: function (oEvent) {
			var oTable = that.getView().byId("catalogContainer");
			var sItemPath = oEvent.getParameter("listItem").getBindingContextPath() + "/discounts";
			var aDiscounts = oTable.getModel().getProperty(sItemPath);
			if (aDiscounts) {
				that._getViewItemDiscountsDialog().open();
				var oViewItemDiscountsTable = sap.ui.getCore().byId("tableItemDiscounts");
				var oViewItemDiscountsTitle = sap.ui.getCore().byId("viewItemDiscountsTitle");
				oViewItemDiscountsTitle.setText("Active Discounts for " + aDiscounts[0].model);
				oViewItemDiscountsTable.setModel(new JSONModel(aDiscounts));
				oViewItemDiscountsTable.bindItems("/", that._tableItemDiscountsRowTemplate());
			}
		},

		_getViewItemDiscountsDialog: function () {
			if (!that._oViewItemDiscountsDialog) {
				that._oViewItemDiscountsDialog = sap.ui.xmlfragment("flyhigh.flyhigh_ui.fragment.customerViewDiscount", that);
			}
			return that._oViewItemDiscountsDialog;
		},

		_destroyViewItemDiscountsDialog: function () {
			if (that._oViewItemDiscountsDialog) {
				that._oViewItemDiscountsDialog.destroy();
				that._oViewItemDiscountsDialog = null;
			}
		},

		onViewItemDiscountsButton: function (oEvent) {
			that._destroyViewItemDiscountsDialog();
		},

		onPressSearch: function (oEvent) {
			var sLocation = that.byId("inputLocation").getValue();
			var sSearch = that.byId("inputSearch").getValue();
			
			oBusyDialog.open();
			var oTable = that.getView().byId("catalogContainer");

			Service.get(`/api/customer/catalog?location=${sLocation}&search=${sSearch}`).then(function (oData) {
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
						oRow.bestDiscount = oRow.discountPrice;
					}
					aAgg.push(oRow);
				} else {
					if (!aAgg[iIndex].hasOwnProperty("discounts")) {
						aAgg[iIndex].discounts = [];
						aAgg[iIndex].discountCount = 0;
					}
					aAgg[iIndex].discounts.push(oRow);
					aAgg[iIndex].discountCount += 1;
					oRow.bestDiscount = oRow.bestDiscount < oRow.discountPrice ? oRow.bestDiscount : oRow.discountPrice;
				}
				return aAgg;
			}, []);
		},
		
		_tableItemDiscountsRowTemplate: function () {
			return new sap.m.ColumnListItem({
				cells: [
					new sap.m.Text({
						text: "{= ${startdate}.substr(0,10)} till {= ${enddate}.substr(0,10)}"
					}),
					new sap.m.Text({
						text: "{discountabsolute}"
					}),
					new sap.m.Text({
						text: "{discountpercentage}"
					}),
					new sap.m.Text({
						text: "{discountPrice} {localcurrency}"
					})
				]
			});
		},
		
		_tableCatalogRowTemplate: function () {
			return new sap.m.ColumnListItem({
				type: "Active",
				cells: [
					new sap.m.Text({
						text: "{location}"
					}),
					new sap.m.Text({
						text: "{model} ({category})"
					}),
					new sap.m.Text({
						text: "{retailPrice} {localcurrency}"
					}),
					new sap.m.Text({
						text: "{description}"
					}),
					new sap.m.Text({
						text: "{bestDiscount}"
					})
				]
			});
		}

	});

});
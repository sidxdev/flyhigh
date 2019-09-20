sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"flyhigh/flyhigh_ui/util/Navigator",
	"flyhigh/flyhigh_ui/util/Service",
	"sap/ui/model/json/JSONModel"
], function (Controller, Navigator, Service, JSONModel) {
	"use strict";

	var that;;

	return Controller.extend("flyhigh.flyhigh_ui.controller.Customer", {

		onInit: function () {
			that = this;

			var oWelcomeTitle = that.getView().byId("welcomeTitle");
			var oTable = that.getView().byId("discountTableContainer");

			// Initialize data
			Service.get("/api/customer/self").then(function (oSelfData) {
				oWelcomeTitle.setText(`Welcome ${oSelfData.userInfo.givenName}!`);
			}).catch(function (err) {});

			// Load Active discounts
			Service.get("/api/customer/activeDiscounts").then(function (oData) {
				oTable.setModel(new JSONModel(oData));
				oTable.bindItems("/data", that._tableCatalogRowTemplate());
			}).catch(function (err) {});
		},

		onPressCatalog: function (oEvent) {
			Navigator.navigate(that, "CustomerCatalog");
		},

		onPressTrips: function (oEvent) {
			Navigator.navigate(that, "CustomerTrips");
		},

		onDiscountItemPress: function (oEvent) {
			//TODO
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
						text: "{description}"
					}),
					new sap.m.Text({
						text: "{retailPrice}"
					}),
					new sap.m.Text({
						text: "{discountPrice}"
					}),
					new sap.m.Text({
						text: "{enddate}"
					})
				]
			});
		}

	});

});
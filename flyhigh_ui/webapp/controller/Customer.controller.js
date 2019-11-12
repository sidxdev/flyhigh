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
			Service.get("/api/customer/discounts").then(function (oData) {
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
						text: "{model} ({category})"
					}),
					new sap.m.Text({
						text: "{description}"
					}),
					new sap.m.Text({
						text: "{discountPrice} ({retailPrice}) {localcurrency}"
					}),
					new sap.m.Text({
						text: "{location} till {enddate}"
					})
				]
			});
		}

	});

});
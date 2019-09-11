sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"flyhigh/flyhigh_ui/util/Navigator",
	"flyhigh/flyhigh_ui/util/Service",
	"sap/ui/model/json/JSONModel"
], function (Controller, Navigator, Service, JSONModel) {
	"use strict";
	
	var that;

	return Controller.extend("flyhigh.flyhigh_ui.controller.VendorCatalog", {
		onInit: function () {
			that = this;
			var oTable = that.getView().byId("tableContainer");

			Service.get("/api/vendor/catalog").then(function (oData) {
				oTable.setModel(new JSONModel(oData));
				oTable.bindItems("/data", that._tableCatalogRowTemplate());
			}).catch(function () {});
		},
		
		onNavBack: function(oEvent) {
			Navigator.navigate(that, "Vendor");
		},

		_tableCatalogRowTemplate: function () {
			return new sap.m.ColumnListItem({
				cells: [
					new sap.m.Text({
						text: "{model}"
					}),
					new sap.m.Text({
						text: "{catalog}"
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
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

	return Controller.extend("flyhigh.flyhigh_ui.controller.VendorCatalog", {
		onInit: function () {
			that = this;
			that._fetchCatalog();
		},

		onNavBack: function (oEvent) {
			Navigator.navigate(that, "Vendor");
		},

		onAddItem: function (oEvent) {
			that._getAddItemDialog().open();
		},

		_getAddItemDialog: function () {
			if (!that._oAddItemDialog) {
				that._oAddItemDialog = sap.ui.xmlfragment("flyhigh.flyhigh_ui.fragment.vendorAddItem", that);
			}
			return that._oAddItemDialog;
		},

		_destroyAddItemDialog: function () {
			if (that._oAddItemDialog) {
				that._oAddItemDialog.destroy();
				that._oAddItemDialog = null;
			}
		},

		onAddItemDialogSave: function (oEvent) {
			if (!Validator.formCheck(that, "addItemContainer")) {
				return;
			}
			var oInputModel = that.getView().byId("inputModel");
			var oInputCategory = that.getView().byId("inputCategory");
			var oInputPrice = that.getView().byId("inputPrice");
			var oInputDesc = that.getView().byId("inputDesc");
			that._destroyAddItemDialog();

			oBusyDialog.open();
			Service.post("/api/vendor/catalog", {
				model: oInputModel.getValue(),
				category: oInputCategory.getValue(),
				retailPrice: oInputPrice.getValue(),
				description: oInputDesc.getValue()
			}).then(function () {
				that._fetchCatalog();
			}).catch(function () {}).finally(function () {
				oBusyDialog.close();
			});
		},

		onAddItemDialogCancel: function (oEvent) {
			that._destroyAddItemDialog();
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
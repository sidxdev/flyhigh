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
			if (!Validator.formCheck("addItemContainer")) {
				return;
			}
			var oInputModel = sap.ui.getCore().byId("inputModel");
			var oInputCategory = sap.ui.getCore().byId("inputCategory");
			var oInputPrice = sap.ui.getCore().byId("inputPrice");
			var oInputDesc = sap.ui.getCore().byId("inputDesc");
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

		onChangeInput: Validator.onChangeInput,

		onCatalogItemPress: function (oEvent) {
			var oTable = that.getView().byId("tableContainer");
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
				that._oViewItemDiscountsDialog = sap.ui.xmlfragment("flyhigh.flyhigh_ui.fragment.vendorItemDiscounts", that);
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

		onDeleteItemDiscount: function (oEvent) {
			var sDiscountidPath = oEvent.getParameter("listItem").getBindingContextPath() + "/discountid";
			var sDiscountid = oEvent.getParameter("listItem").getModel().getProperty(sDiscountidPath);

			that._destroyViewItemDiscountsDialog();
			oBusyDialog.open();
			Service.delete("/api/vendor/discount/" + sDiscountid).then(function () {
				that._fetchCatalog();
			}).finally(function () {
				oBusyDialog.close();
			});
		},

		onAddDiscount: function (oEvent) {
			var oTable = that.getView().byId("tableContainer");
			var sItemPath = oEvent.getSource().getParent().getBindingContextPath();
			var sCatalogid = oTable.getModel().getProperty(sItemPath + "/catalogid");
			
			that._getAddDiscountsDialog().open();
			
			var sCatalogText = oTable.getModel().getProperty(sItemPath + "/model");
			var oAddDiscountTitle = sap.ui.getCore().byId("addDiscountTitle");
			var oAddDiscountCatalogId = sap.ui.getCore().byId("addDiscountCatalogId");
			oAddDiscountTitle.setTitle("Add discount to " + sCatalogText);
			oAddDiscountCatalogId.setText(sCatalogid);
		},

		_getAddDiscountsDialog: function () {
			if (!that._oAddDiscountsDialog) {
				that._oAddDiscountsDialog = sap.ui.xmlfragment("flyhigh.flyhigh_ui.fragment.vendorAddDiscount", that);
			}
			return that._oAddDiscountsDialog;
		},

		_destroyAddDiscountsDialog: function () {
			if (that._oAddDiscountsDialog) {
				that._oAddDiscountsDialog.destroy();
				that._oAddDiscountsDialog = null;
			}
		},

		onAddDiscountDialogSave: function (oEvent) {
			if (!Validator.formCheck("addDiscountContainer")) {
				return;
			}
			var oLabelCatalogid = sap.ui.getCore().byId("addDiscountCatalogId");
			var oInputStartDate = sap.ui.getCore().byId("inputStartDate");
			var oInputEndDate = sap.ui.getCore().byId("inputEndDate");
			var oInputAbsDisc = sap.ui.getCore().byId("inputAbsDisc");
			var oInputPerDisc = sap.ui.getCore().byId("inputPerDisc");
			that._destroyAddDiscountsDialog();

			oBusyDialog.open();
			Service.post("/api/vendor/discount", {
				catalogid: oLabelCatalogid.getText(),
				startdate: oInputStartDate.getValue(),
				enddate: oInputEndDate.getValue(),
				absdisc: oInputAbsDisc.getValue(),
				perdisc: oInputPerDisc.getValue()
			}).then(function () {
				that._fetchCatalog();
			}).catch(function () {}).finally(function () {
				oBusyDialog.close();
			});
		},

		onAddDiscountDialogCancel: function (oEvent) {
			that._destroyAddDiscountsDialog();
		},

		_fetchCatalog: function () {
			oBusyDialog.open();
			var oTable = that.getView().byId("tableContainer");

			Service.get("/api/vendor/catalog").then(function (oData) {
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
						aAgg[iIndex].discountCount = 1;
					}
					aAgg[iIndex].discounts.push(oRow);
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
					new sap.m.Button({
						icon: "sap-icon://add",
						text: "{discountCount}",
						press: that.onAddDiscount
					})
				]
			});
		},

		_tableItemDiscountsRowTemplate: function () {
			return new sap.m.ColumnListItem({
				cells: [
					new sap.m.Text({
						text: "{startdate}"
					}),
					new sap.m.Text({
						text: "{enddate}"
					}),
					new sap.m.Text({
						text: "{discountabsolute}"
					}),
					new sap.m.Text({
						text: "{discountpercentage}"
					})
				]
			});
		}
	});

});
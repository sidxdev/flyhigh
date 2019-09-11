sap.ui.define([
	"sap/ui/base/Object",
	"sap/m/BusyDialog",
	"flyhigh/flyhigh_ui/util/Service", 
	"sap/ui/core/routing/History"
], function (Object, BusyDialog, Service, History) {
	"use strict";

	var Navigator = {};

	Navigator.toString = function () {
		return "flyhigh.flyhigh_ui.util.Navigator";
	};

	Navigator.scopeCheck = function (oCtx, sScope) {
		return new Promise(function (resolve, reject) {
			var oBusyDialog = new BusyDialog({});

			oBusyDialog.open();
			Service.checkAuth(sScope).then(resolve).catch(function () {
				Navigator.navigate(oCtx, "Unauthorized");
				reject();
			}).finally(function () {
				oBusyDialog.close();
			});
		});
	};

	Navigator.navigate = function (oCtx, sRoute) {
		var oRouter = sap.ui.core.UIComponent.getRouterFor(oCtx);
		var sCurrentRoute = oRouter.getHashChanger().hash;
		// Only Route if already not there
		if (sCurrentRoute !== sRoute) {
			oRouter.navTo(sRoute);
		}
	};

	return Navigator;
});
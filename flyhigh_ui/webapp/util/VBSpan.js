/* eslint-disable sap-no-dom-insertion
 */
sap.ui.define([
	"sap/m/VBox"
], function (VBox) {
	var VBSpan = VBox.extend("flyhigh.flyhigh_ui.util.VBSpan", {
		metadata: {
			properties: {
				span: {
					type: "int",
					defaultValue: 12
				},
				forceChildrenWidth: {
					type: "boolean",
					defaultValue: true
				}
			},
			aggregations: {},
			events: {}
		},

		constructor: function () {
			sap.ui.core.Control.apply(this, arguments);
			var iSpan = this.getSpan();
			this.setLayoutData(new sap.ui.layout.GridData({
				span: "XL" + iSpan + " L" + iSpan + " M" + iSpan + " S12"
			}));
			this.setWidth("100%");
		},

		init: function () {

		},

		renderer: function (oRm, oControl) {
			oRm.write("<div");
			oRm.writeControlData(oControl);
			oRm.write(">");
			// Render children
			oControl.getItems().forEach(function(oView) {
				// Set Children as 100% width
				if(oControl.getForceChildrenWidth() && typeof oView.setWidth === "function") {
					oView.setWidth("100%");
				}
				oRm.renderControl(oView);
			});
			oRm.write("</div>");
		},

		onAfterRendering: function () {
			if (sap.ui.core.Control.prototype.onAfterRendering) {
				sap.ui.core.Control.prototype.onAfterRendering.apply(this, arguments);
			}
		}
	});

	return VBSpan;
});
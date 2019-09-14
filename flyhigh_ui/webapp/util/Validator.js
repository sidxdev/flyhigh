sap.ui.define([
	"sap/ui/base/Object"
], function (Object) {
	"use strict";

	var Validator = {};

	Validator.toString = function () {
		return "flyhigh.flyhigh_ui.util.Validator";
	};

	/**
		Looks for sFormRoot view element by ID then parses the children.
		Goes through only particular element types - 
		[ sap.m.Input, sap.m.MaskInput, sap.m.TextArea, sap.m.DatePicker ]
		Each type has a defined way to fetch it's value or fetch it's required state (XML required = true)
		Check field value and sets ValueState of Element to Error or None accordingly.
		
		@parma oCtx: this context of controller
		@param sFormRoot: string form id of container view in XML. Usually SimpleForm
		@return boolean: final validation state 
	**/
	// ********************************************************************************
	// Default Input Functions
	var formCheckHelper = {};
	formCheckHelper.oDefaultInput = {
		valueFn: function (oElement) {
			return oElement.getValue();
		},
		requiredFn: function (oElement) {
			return oElement.getRequired();
		}
	};
	// Input Types to be checked with their value functions
	formCheckHelper.aInputTags = {
		"sap.m.Input": formCheckHelper.oDefaultInput,
		"sap.m.MaskInput": formCheckHelper.oDefaultInput,
		"sap.m.TextArea": formCheckHelper.oDefaultInput,
		"sap.m.DatePicker": formCheckHelper.oDefaultInput,
		"sap.m.DateTimePicker": formCheckHelper.oDefaultInput,
		"sap.m.CheckBox": {
			valueFn: function (oElement) {
				return oElement.getSelected() ? "yes" : "";
			},
			requiredFn: function (oElement) {
				return oElement.data("required") === "true";
			}
		},
		"sap.m.Select": {
			valueFn: function (oElement) {
				return oElement.getSelectedKey();
			},
			requiredFn: function (oElement) {
				return oElement.data("required") === "true";
			}
		}
	};
	// ********************************************************************************
	Validator.formCheck = function (sFormRoot) {
		var bValidated = true;
		var oView = sap.ui.getCore().byId(sFormRoot);
		var aElements = Validator.getChildrenRecursively(oView);

		aElements.forEach(function (oElement) {
			var sType = oElement.getMetadata().getName();
			// Only process the Input Types
			if (!formCheckHelper.aInputTags.hasOwnProperty(sType)) {
				return;
			}

			// Exclude optional fields
			if (!formCheckHelper.aInputTags[sType].requiredFn(oElement)) {
				// Reset Value state for optional fields if they are blank
				if (formCheckHelper.aInputTags[sType].valueFn(oElement) === "") {
					oElement.setValueState(sap.ui.core.ValueState.None);
				} else {
					// Check option field ValueState, if its filled then validate
					bValidated = oElement.getValueState() === "Error" ? false : bValidated;
				}
				return;
			}

			// If value state is already error, invalidate form as validation is at individual element
			if (oElement.getValueState() === "Error") {
				bValidated = false;
				return;
			}

			// Check for field value for required fields
			if (formCheckHelper.aInputTags[sType].valueFn(oElement) === "") {
				// Set Error for the required inputs
				oElement.setValueState(sap.ui.core.ValueState.Error);
				bValidated = false;
			} else {
				oElement.setValueState(sap.ui.core.ValueState.None);
			}
		});

		return bValidated;
	};

	/**
		Recursively parse a view and get all the children elements 
		and skips the elements with [visible = false].
		Checks these methods for children -
		[getCells, getContent, getItems, getFixContent, getFlexContent]
		
		@parma oView: the view to parse
		@return []: all elements
	**/
	Validator.getChildrenRecursively = function (oView) {
		var aElementsToScan = [];

		// filter hidden
		if (typeof oView.getVisible === "function" && !oView.getVisible()) {
			return [];
		}

		// return base elements immediately
		if (formCheckHelper.aInputTags.hasOwnProperty(oView.getMetadata().getName())) {
			return [oView];
		}

		if (Array.isArray(oView)) {
			aElementsToScan = oView;
		} else if (typeof oView.getCells === "function") {
			aElementsToScan = oView.getCells();
		} else if (typeof oView.getContent === "function") {
			aElementsToScan = oView.getContent();
		} else if (typeof oView.getItems === "function") {
			aElementsToScan = oView.getItems();
		} else if (typeof oView.getFixContent === "function") {
			aElementsToScan = oView.getFixContent();
			aElementsToScan.push(oView.getFlexContent());
		} else {
			return [oView];
		}

		return aElementsToScan.reduce(function (aElements, oElement) {
			aElements.push(Validator.getChildrenRecursively(oElement));
			return [].concat.apply([], aElements);
		}, []);
	};
	
	Validator.onChangeInput = function (oEvent) {
		var oInput = oEvent.getSource();
		if (oInput.getValue() === "") {
			oInput.setValueState("Error");
		} else {
			oInput.setValueState("None");
		}
	};

	return Validator;
});
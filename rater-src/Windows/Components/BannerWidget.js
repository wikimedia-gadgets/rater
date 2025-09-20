import ParameterListWidget from "./ParameterListWidget";
import ParameterWidget from "./ParameterWidget";
import DropdownParameterWidget from "./DropdownParameterWidget";
import SuggestionLookupTextInputWidget from "./SuggestionLookupTextInputWidget";
import { filterAndMap, classMask, importanceMask } from "../../util";
import {Template, getWithRedirectTo} from "../../Template";
import HorizontalLayoutWidget from "./HorizontalLayoutWidget";
import globalConfig from "../../config";
import i18n from "../../i18n";
// <nowiki>

// Function to create localized UI elements
function createBannerWidgetElements(useI18n = false) {
	const t = useI18n ? i18n.t : (key) => key;
	
	return {
		removeButton: {
			icon: "trash",
			label: t("button-remove-banner"),
			title: t("button-remove-banner"),
			flags: "destructive",
			$element: $("<div style=\"width:100%\">")
		},
		clearButton: {
			icon: "cancel",
			label: t("button-clear-parameters"),
			title: t("button-clear-parameters"),
			flags: "destructive"
		},
		parameterNameInput: {
			placeholder: t("placeholder-parameter-name"),
			value: ""
		},
		parameterValueInput: {
			placeholder: t("placeholder-parameter-value"),
			value: ""
		},
		addButton: {
			label: t("button-add"),
			flags: "primary"
		},
		equalsLabel: {
			label: "="
		},
		addParameterLabel: {
			label: t("label-add-parameter")
		},
		classLabel: t("label-class"),
		importanceLabel: t("label-importance"),
		optionNoClass: t("option-no-class"),
		optionNoImportance: t("option-no-importance"),
		optionAutoDetect: t("option-auto-detect"),
		optionInheritFromShell: t("option-inherit-from-shell"),
		inactiveSuffix: t("label-inactive-suffix")
	};
}

// Initialize with English fallback
BannerWidget.staticElements = createBannerWidgetElements(false);

// Update with i18n after language is loaded
i18n.load().then(() => {
	BannerWidget.staticElements = createBannerWidgetElements(true);
});

function BannerWidget( template, config ) {
	// Configuration initialization
	config = config || {};
	// Call parent constructor
	BannerWidget.super.call( this, config );
	this.$overlay = config.$overlay;

	/* --- PREFS --- */
	this.preferences = config.preferences;
	
	/* --- PROPS --- */
	this.paramData = template.paramData;
	this.paramAliases = template.paramAliases || {};
	this.parameterSuggestions = template.parameterSuggestions;
	this.name = template.name;
	this.wikitext = template.wikitext;
	this.pipeStyle = template.pipeStyle;
	this.equalsStyle = template.equalsStyle;
	this.endBracesStyle = template.endBracesStyle;
	this.mainText = template.getTitle().getMainText();
	this.redirectTargetMainText = template.redirectTarget && template.redirectTarget.getMainText();
	this.isShellTemplate = template.isShellTemplate();
	this.changed = template.parameters.some(parameter => parameter.autofilled); // initially false, unless some parameters were autofilled
	this.hasClassRatings = template.classes && template.classes.length;
	this.hasImportanceRatings = template.importances && template.importances.length;
	this.inactiveProject = template.inactiveProject;

	/* --- TITLE AND RATINGS --- */

	this.removeButton = new OO.ui.ButtonWidget( BannerWidget.staticElements.removeButton );
	this.clearButton = new OO.ui.ButtonWidget( BannerWidget.staticElements.clearButton );
	this.removeButton.$element.find("a").css("width","100%");
	this.clearButton.$element.find("a").css("width","100%");

	this.titleButtonsGroup = new OO.ui.ButtonGroupWidget( {
		items: [ this.removeButton,	this.clearButton ],
		$element: $("<span style='width:100%;'>"),
	} );

	this.mainLabelPopupButton = new OO.ui.PopupButtonWidget( {
		label: `{{${template.getTitle().getMainText()}}}${this.inactiveProject ? BannerWidget.staticElements.inactiveSuffix : ""}`,
		$element: $("<span style='display:inline-block;width:48%;margin-right:0;padding-right:8px'>"),
		$overlay: this.$overlay,
		indicator:"down",
		framed:false,
		popup: {
			$content: this.titleButtonsGroup.$element,
			width: 200,
			padded: false,
			align: "force-right",
			anchor: false
		}
	} );
	this.mainLabelPopupButton.$element
		.children("a").first().css({"font-size":"110%"})
		.find("span.oo-ui-labelElement-label").css({"white-space":"normal"});

	// Rating dropdowns
	if (this.isShellTemplate) {
		this.classDropdown = new DropdownParameterWidget( {
			label: new OO.ui.HtmlSnippet(`<span style="color:#777">${BannerWidget.staticElements.classLabel}</span>`),
			menu: {
				items: [
					new OO.ui.MenuOptionWidget( {
						data: null,
						label: new OO.ui.HtmlSnippet(`<span style="color:#777">(${config.isArticle ? BannerWidget.staticElements.optionNoClass : BannerWidget.staticElements.optionAutoDetect})</span>`)
					} ),
					...globalConfig.bannerDefaults.classes.map( classname =>
						new OO.ui.MenuOptionWidget( {
							data: classname,
							label: classname
						} )
					)
				],
			},
			$overlay: this.$overlay,
		} );
		var shellClassParam = template.parameters.find(parameter => parameter.name === "class");
		this.classDropdown.getMenu().selectItemByData( shellClassParam && classMask(shellClassParam.value) );
	} else if (this.hasClassRatings) {
		this.classDropdown = new DropdownParameterWidget( {
			label: new OO.ui.HtmlSnippet(`<span style="color:#777">${BannerWidget.staticElements.classLabel}</span>`),
			menu: {
				items: [
					new OO.ui.MenuOptionWidget( {
						data: null,
						label: new OO.ui.HtmlSnippet(`<span style="color:#777">(${config.isArticle ? BannerWidget.staticElements.optionInheritFromShell : BannerWidget.staticElements.optionAutoDetect})</span>`)
					} ),
					...template.classes.map( classname =>
						new OO.ui.MenuOptionWidget( {
							data: classname,
							label: classname
						} )
					)
				],
			},
			$overlay: this.$overlay,
		} );
		var classParam = template.parameters.find(parameter => parameter.name === "class");
		this.classDropdown.getMenu().selectItemByData( classParam && classMask(classParam.value) );
	}

	if (this.hasImportanceRatings) {
		this.importanceDropdown = new DropdownParameterWidget( {
			label: new OO.ui.HtmlSnippet(`<span style="color:#777">${BannerWidget.staticElements.importanceLabel}</span>`),
			menu: {
				items: [
					new OO.ui.MenuOptionWidget( {
						data: null, label: new OO.ui.HtmlSnippet(`<span style="color:#777">(${config.isArticle ? BannerWidget.staticElements.optionNoImportance : BannerWidget.staticElements.optionAutoDetect})</span>`)
					} ),
					...template.importances.map(importance =>
						new OO.ui.MenuOptionWidget( {
							data: importance,
							label: importance
						} )
					)
				]
			},
			$overlay: this.$overlay,
		} );
		var importanceParam = template.parameters.find(parameter => parameter.name === "importance");
		this.importanceDropdown.getMenu().selectItemByData( importanceParam && importanceMask(importanceParam.value) );
	}

	this.titleLayout = new OO.ui.HorizontalLayout( {
		items: [ this.mainLabelPopupButton ]
	} );
	if (this.hasClassRatings || this.isShellTemplate) {
		this.titleLayout.addItems([ this.classDropdown ]);
	}
	if (this.hasImportanceRatings) {
		this.titleLayout.addItems([ this.importanceDropdown ]);
	}

	/* --- PARAMETERS LIST --- */

	var parameterWidgets = filterAndMap(
		template.parameters,
		param => {
			if ( this.isShellTemplate ) {
				if (param.name == "1") {
					this.shellParam1Value = param.value;
					return false;
				}
				return param.name !== "class";
			}
			return param.name !== "class" && param.name !== "importance";
		},
		param => new ParameterWidget(param, template.paramData[param.name], {$overlay: this.$overlay})
	);

	this.parameterList = new ParameterListWidget( {
		items: parameterWidgets,
		preferences: this.preferences
	} );

	/* --- ADD PARAMETER SECTION --- */

	this.addParameterNameInput = new SuggestionLookupTextInputWidget({
		suggestions: template.parameterSuggestions,
		placeholder: BannerWidget.staticElements.parameterNameInput.placeholder,
		$element: $("<div style='display:inline-block;width:40%'>"),
		validate: function(val) {
			let {validName, name, value} = this.getAddParametersInfo(val);
			return (!name && !value) ? true : validName;
		}.bind(this),
		allowSuggestionsWhenEmpty: true,
		$overlay: this.$overlay
	});
	this.updateAddParameterNameSuggestions();
	this.addParameterValueInput = new SuggestionLookupTextInputWidget({
		placeholder: BannerWidget.staticElements.parameterValueInput.placeholder,
		$element: $("<div style='display:inline-block;width:40%'>"),
		validate: function(val) {
			let {validValue, name, value} = this.getAddParametersInfo(null, val);
			return (!name && !value) ? true : validValue;
		}.bind(this),
		allowSuggestionsWhenEmpty: true,
		$overlay: this.$overlay
	});
	this.addParameterButton = new OO.ui.ButtonWidget({
		...BannerWidget.staticElements.addButton,
		icon: "add",
		flags: "progressive"
	}).setDisabled(true);
	this.addParameterControls = new HorizontalLayoutWidget( {
		items: [
			this.addParameterNameInput,
			new OO.ui.LabelWidget({label: BannerWidget.staticElements.equalsLabel.label}),
			this.addParameterValueInput,
			this.addParameterButton
		]
	} );

	this.addParameterLayout = new OO.ui.FieldLayout(this.addParameterControls, {
		label: BannerWidget.staticElements.addParameterLabel.label,
		align: "top"
	}).toggle(false);
	// A hack to make messages appear on their own line
	this.addParameterLayout.$element.find(".oo-ui-fieldLayout-messages").css({
		"clear": "both",
		"padding-top": 0
	});

	/* --- OVERALL LAYOUT/DISPLAY --- */

	// Display the layout elements, and a rule
	this.$element.addClass("rater-bannerWidget").append(
		this.titleLayout.$element,
		this.parameterList.$element,
		this.addParameterLayout.$element
	);
	if (!this.isShellTemplate) {
		this.$element.append( $("<hr>") );
	}

	if (this.isShellTemplate) {
		this.$element.css({
			"background": "#eee",
			"border-radius": "10px",
			"padding": "0 10px 5px",
			"margin-bottom": "12px",
			"font-size": "92%"			
		});
	}

	/* --- EVENT HANDLING --- */

	if (this.hasClassRatings) {
		this.classDropdown.connect( this, {"change": "onClassChange" } );
	}
	if (this.hasImportanceRatings) {
		this.importanceDropdown.connect( this, {"change": "onImportanceChange" } );
	}
	this.parameterList.connect( this, {
		"change": "onParameterChange",
		"addParametersButtonClick": "showAddParameterInputs",
		"updatedSize": "onUpdatedSize"
	} );
	this.addParameterButton.connect(this, { "click": "onParameterAdd" });
	this.addParameterNameInput.connect(this, {
		"change": "onAddParameterNameChange",
		"enter": "onAddParameterNameEnter",
		"choose": "onAddParameterNameEnter"
	});
	this.addParameterValueInput.connect(this, {
		"change": "onAddParameterValueChange",
		"enter": "onAddParameterValueEnter",
		"choose": "onAddParameterValueEnter"
	});
	this.removeButton.connect(this, {"click": "onRemoveButtonClick"}, );
	this.clearButton.connect( this, {"click": "onClearButtonClick"} );

	/* --- APPLY PREF -- */
	if (this.preferences.bypassRedirects) {
		this.bypassRedirect();
	}

	// Refresh instance labels/placeholders after i18n loads
	i18n.load().then(function(){ this.applyI18nStrings(); }.bind(this));

}
OO.inheritClass( BannerWidget, OO.ui.Widget );

/**
 * @param {String} templateName
 * @param {Object} [data]
 * @param {Boolean} data.withoutRatings
 * @param {Boolean} data.isWrapper
 * @param {Object} config
 * @returns {Promise<BannerWidget>}
 */
BannerWidget.newFromTemplateName = function(templateName, data, config) {
	var template = new Template();
	template.name = templateName;
	if (data && data.withoutRatings) {
		template.withoutRatings = true;
	}
	return getWithRedirectTo(template)
		.then(function(template) {
			return $.when(
				template.setClassesAndImportances(),
				template.setParamDataAndSuggestions()
			).then(() => {
				// Add missing required/suggested values
				template.addMissingParams();
				// Return the now-modified template
				return template;
			});
		})
		.then(template => new BannerWidget(template, config));
};

BannerWidget.prototype.onUpdatedSize = function() {
	// Emit an "updatedSize" event so the parent window can update size, if needed
	this.emit("updatedSize");
};

BannerWidget.prototype.setChanged = function() {
	this.changed = true;
	this.emit("changed");
	if (this.mainText === "WikiProject Biography" || this.redirectTargetMainText === "WikiProject Biography") {
		// Emit event so BannerListWidget can update the banner shell template (if present)
		this.emit("biographyBannerChange");		
	}
};

BannerWidget.prototype.onParameterChange = function() {
	this.setChanged();
	this.updateAddParameterNameSuggestions();
};

BannerWidget.prototype.onClassChange = function() {
	this.setChanged();
	this.classChanged = true;
	var classItem = this.classDropdown.getMenu().findSelectedItem();
	if (classItem && classItem.getData() == null ) {
		// clear selection
		this.classDropdown.getMenu().selectItem();
	}
};

BannerWidget.prototype.onImportanceChange = function() {
	this.setChanged();
	this.importanceChanged = true;
	var importanceItem = this.importanceDropdown.getMenu().findSelectedItem();
	if (importanceItem && importanceItem.getData() == null ) {
		// clear selection
		this.importanceDropdown.getMenu().selectItem();
	}
};

BannerWidget.prototype.showAddParameterInputs = function() {
	this.addParameterLayout.toggle(true);
	this.addParameterNameInput.focus();
	this.onUpdatedSize();
};

BannerWidget.prototype.getAddParametersInfo = function(nameInputVal, valueInputVal) {
	var name = nameInputVal && nameInputVal.trim() || this.addParameterNameInput.getValue().trim();
	var paramAlreadyIncluded = name === "class" ||
		name === "importance" ||
		(name === "1" && this.isShellTemplate) ||
		this.parameterList.getParameterItems().some(paramWidget => paramWidget.name === name);
	var value = valueInputVal && valueInputVal.trim() || this.addParameterValueInput.getValue().trim();
	var autovalue = name && this.paramData[name] && this.paramData[name].autovalue || null;
	return {
		validName: !!(name && !paramAlreadyIncluded),
		validValue: !!(value || autovalue),
		isAutovalue: !!(!value && autovalue),
		isAlreadyIncluded: !!(name && paramAlreadyIncluded),
		name,
		value,
		autovalue
	};
};

BannerWidget.prototype.onAddParameterNameChange = function() {
	let { validName, validValue, isAutovalue, isAlreadyIncluded, name, autovalue } = this.getAddParametersInfo();
	// Set value input placeholder as the autovalue
	this.addParameterValueInput.$input.attr( "placeholder",  autovalue || "" );
	// Set suggestions, if the parameter has a list of allowed values
	var allowedValues = this.paramData[name] &&
		this.paramData[name].allowedValues && 
		this.paramData[name].allowedValues.map(val => {return {data: val, label:val}; });
	this.addParameterValueInput.setSuggestions(allowedValues || []);
	// Set button disabled state based on validity
	this.addParameterButton.setDisabled(!validName || !validValue);
	// Show notice if autovalue will be used
	this.addParameterLayout.setNotices( validName && isAutovalue ? [i18n.t("notice-parameter-autofilled")] : [] );
	// Show error is the banner already has the parameter set
	this.addParameterLayout.setErrors( isAlreadyIncluded ? [i18n.t("error-parameter-present")] : [] );
};

BannerWidget.prototype.onAddParameterNameEnter = function() {
	this.addParameterValueInput.focus();
};

BannerWidget.prototype.onAddParameterValueChange = function() {
	let { validName, validValue, isAutovalue } = this.getAddParametersInfo();
	this.addParameterButton.setDisabled(!validName || !validValue);
	this.addParameterLayout.setNotices( validName && isAutovalue ? [i18n.t("notice-parameter-autofilled")] : [] ); 
};

BannerWidget.prototype.onAddParameterValueEnter = function() {
	// Make sure button state has been updated
	this.onAddParameterValueChange();
	// Do nothing if button is disabled (i.e. name and/or value are invalid)
	if ( this.addParameterButton.isDisabled() ) {
		return;
	}
	// Add parameter
	this.onParameterAdd();
};

BannerWidget.prototype.onParameterAdd = function() {
	let { validName, validValue, name, value, autovalue }  = this.getAddParametersInfo();
	if (!validName || !validValue) {
		// Error should already be shown via onAddParameter...Change methods
		return;
	}
	var newParameter = new ParameterWidget(
		{
			"name": name,
			"value": value || autovalue
		},
		this.paramData[name],
		{$overlay: this.$overlay}
	);
	this.parameterList.addItems([newParameter]);
	this.addParameterNameInput.setValue("");
	this.addParameterValueInput.setValue("");
	this.addParameterNameInput.$input.focus();
};

BannerWidget.prototype.updateAddParameterNameSuggestions = function() {
	let paramsInUse = {};
	this.parameterList.getParameterItems().forEach(
		paramWidget => paramsInUse[paramWidget.name] = true
	);
	this.addParameterNameInput.setSuggestions(
		this.parameterSuggestions.filter(
			suggestion => !paramsInUse[suggestion.data]
		)
	);
};

BannerWidget.prototype.applyI18nStrings = function() {
	var S = BannerWidget.staticElements || {};
	// Buttons
	if (S.removeBanner) {
		this.removeButton.setLabel(S.removeBanner);
		this.removeButton.setTitle(S.removeBanner);
	}
	if (S.clearParameters) {
		this.clearButton.setLabel(S.clearParameters);
		this.clearButton.setTitle(S.clearParameters);
	}
	// Inputs
	if (S.parameterNameInput && S.parameterNameInput.placeholder) {
		this.addParameterNameInput.$input.attr("placeholder", S.parameterNameInput.placeholder);
	}
	if (S.parameterValueInput && S.parameterValueInput.placeholder) {
		this.addParameterValueInput.$input.attr("placeholder", S.parameterValueInput.placeholder);
	}
	// Add button
	if (S.addButton && S.addButton.label) {
		this.addParameterButton.setLabel(S.addButton.label);
	}
	// Field label
	if (S.addParameterLabel && S.addParameterLabel.label) {
		this.addParameterLayout.setLabel(S.addParameterLabel.label);
	}
	// Title inactive suffix
	if (this.inactiveProject) {
		this.mainLabelPopupButton.setLabel(`{{${this.mainText}}}${i18n.t("label-inactive-suffix")}`);
	}
	// Dropdown headers and first options
	if (this.classDropdown) {
		this.classDropdown.setLabel(new OO.ui.HtmlSnippet(`<span style="color:#777">${i18n.t("label-class")}</span>`));
		var classFirst = this.classDropdown.getMenu().findItemFromData(null);
		if (classFirst) {
			classFirst.setLabel(new OO.ui.HtmlSnippet(`<span style="color:#777">(${i18n.t("option-auto-detect")})</span>`));
		}
	}
	if (this.importanceDropdown) {
		this.importanceDropdown.setLabel(new OO.ui.HtmlSnippet(`<span style="color:#777">${i18n.t("label-importance")}</span>`));
		var impFirst = this.importanceDropdown.getMenu().findItemFromData(null);
		if (impFirst) {
			impFirst.setLabel(new OO.ui.HtmlSnippet(`<span style="color:#777">(${i18n.t("option-auto-detect")})</span>`));
		}
	}
};

BannerWidget.prototype.onRemoveButtonClick = function() {
	this.emit("remove");
};

BannerWidget.prototype.onClearButtonClick = function() {
	this.parameterList.clearItems(
		this.parameterList.getParameterItems()
	);
	if ( this.hasClassRatings ) {
		this.classDropdown.getMenu().selectItem();
	}
	if ( this.hasImportanceRatings ) {
		this.importanceDropdown.getMenu().selectItem();
	}
};

BannerWidget.prototype.bypassRedirect = function() {
	if (!this.redirectTargetMainText) {
		return;
	}
	// Store the bypassed name
	this.bypassedName = this.name;
	// Update title label
	this.mainLabelPopupButton.setLabel(`{{${this.redirectTargetMainText}}}${this.inactiveProject ? i18n.t("label-inactive-suffix") : ""}`);
	// Update properties
	this.name = this.redirectTargetMainText;
	this.mainText = this.redirectTargetMainText;
	this.redirectTargetMainText = null;
	this.setChanged();
};

BannerWidget.prototype.makeWikitext = function() {
	if (!this.changed && this.wikitext) {
		return this.wikitext;
	}
	var pipe = this.pipeStyle;
	var equals = this.equalsStyle;
	var classItem = (this.hasClassRatings || this.isShellTemplate) && this.classDropdown.getMenu().findSelectedItem();
	var classVal = classItem && classItem.getData();
	var importanceItem = this.hasImportanceRatings && this.importanceDropdown.getMenu().findSelectedItem();
	var importanceVal = importanceItem && importanceItem.getData();

	return ("{{" +
		this.name +
		( (this.hasClassRatings || this.isShellTemplate) && classVal!=null ? `${pipe}class${equals}${classVal||""}` : "" ) +
		( this.hasImportanceRatings && importanceVal!=null ? `${pipe}importance${equals}${importanceVal||""}` : "" ) +
		this.parameterList.getParameterItems()
			.map(parameter => parameter.makeWikitext(pipe, equals))
			.join("") +
		this.endBracesStyle)
		.replace(/\n+}}$/, "\n}}"); // avoid empty line at end like [[Special:Diff/925982142]]
};

BannerWidget.prototype.setPreferences = function(prefs) {
	this.preferences = prefs;
	if (this.preferences.bypassRedirects) {
		this.bypassRedirect();
	}
	this.parameterList.setPreferences(prefs);
};

export default BannerWidget;
// </nowiki>
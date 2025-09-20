// <nowiki>
const packagejson = require("../package.json");
var version = packagejson.version;

// A global object that stores all the page and user configuration and settings
var config = {
	// Script info
	script: {
		// Advert to append to edit summaries
		advert:  ` ([[WP:RATER#${version}|Rater]])`,
		version: version
	},
	// Default preferences, if user subpage raterPrefs.json does not exist
	defaultPrefs: {
		"autostart": false,
		"autostartRedirects": false,
		"autostartNamespaces": [0],
		"minForShell": 1,
		"bypassRedirects": true,
		"autofillClassFromOthers": true,
		"autofillClassFromOres": true,
		"autofillImportance": true,
		"collapseParamsLowerLimit": 6,
		"watchlist": "preferences"
	},
	// MediaWiki configuration values
	mw: mw.config.get( [
		"skin",
		"wgPageName",
		"wgNamespaceNumber",
		"wgUserName",
		"wgFormattedNamespaces",
		"wgMonthNames",
		"wgRevisionId",
		"wgScriptPath",
		"wgServer",
		"wgCategories",
		"wgIsMainPage"
	] ),
	bannerDefaults: {
		classes: [
			"FA",
			"FL",
			"A",
			"GA",
			"B",
			"C",
			"Start",
			"Stub",
			"List"
		],
		importances: [
			"Top",
			"High",
			"Mid",
			"Low"
		],
		extendedClasses: [
			"Category",
			"Draft",
			"File",
			"FM",
			"Portal",
			"Project",
			"Template",
			"Bplus",
			"Future",
			"Current",
			"Disambig",
			"NA",
			"Redirect",
			"Book"
		],
		extendedImportances: [
			"Top",
			"High",
			"Mid",
			"Low",
			"Bottom",
			"NA"
		]
	},
	customBanners: {
		"WikiProject Military history": {
			classes: [
				"FA",
				"FL",
				"A",
				"GA",
				"B",
				"C",
				"Start",
				"Stub",
				"List",
				"AL",
				"BL",
				"CL",
				"Category",
				"Draft",
				"File",
				"Portal",
				"Project",
				"Template",
				"Disambig",
				"Redirect",
				"Book"
			],
			importances: []
		},
		"WikiProject Portals": {
			classes: [
				"FPo",
				"Complete",
				"Substantial",
				"Basic",
				"Incomplete",
				"Meta",
				"List",
				"Category",
				"Draft",
				"File",
				"Project",
				"Template",
				"Disambig",
				"NA",
				"Redirect"
			],
			importances: [
				"Top",
				"High",
				"Mid",
				"Low",
				"Bottom",
				"NA"
			]
		},
		"WikiProject Video games": {
			classes: [
				"FA","FL","FM","GA","B","C","Start","Stub","List","Category","Draft","File","Portal","Project","Template","Disambig","Redirect"
			],
			importances: [
				"Top","High","Mid","Low","NA"
			]
		}
	},
	shellTemplates: [
		"WikiProject banner shell",
		"WikiProjectBanners",
		"WikiProject Banners",
		"WPB",
		"WPBS",
		"Wikiprojectbannershell",
		"WikiProject Banner Shell",
		"Wpb",
		"WPBannerShell",
		"Wpbs",
		"Wikiprojectbanners",
		"WP Banner Shell",
		"WP banner shell",
		"Bannershell",
		"Wikiproject banner shell",
		"WikiProject Banners Shell",
		"WikiProjectBanner Shell",
		"WikiProjectBannerShell",
		"WikiProject BannerShell",
		"WikiprojectBannerShell",
		"WikiProject banner shell/redirect",
		"WikiProject Shell",
		"Banner shell",
		"Scope shell",
		"Project shell",
		"WikiProject banner"
	],
	defaultParameterData: {
		"auto": {
			"label": {
				"en": "Auto-rated"
			},
			"description": {
				"en": "Automatically rated by a bot. Allowed values: ['yes']."
			},
			"autovalue": "yes"
		},
		"listas": {
			"label": {
				"en": "List as"
			},
			"description": {
				"en": "Sortkey for talk page"
			}
		},
		"small": {
			"label": {
				"en": "Small?",
			},
			"description": {
				"en": "Display a small version. Allowed values: ['yes']."
			},
			"autovalue": "yes"
		},
		"attention": {
			"label": {
				"en": "Attention required?",
			},
			"description": {
				"en": "Immediate attention required. Allowed values: ['yes']."
			},
			"autovalue": "yes"
		},
		"needs-image": {
			"label": {
				"en": "Needs image?",
			},
			"description": {
				"en": "Request that an image or photograph of the subject be added to the article. Allowed values: ['yes']."
			},
			"aliases": [
				"needs-photo"
			],
			"autovalue": "yes",
			"suggested": true
		},
		"needs-infobox": {
			"label": {
				"en": "Needs infobox?",
			},
			"description": {
				"en": "Request that an infobox be added to the article. Allowed values: ['yes']."
			},
			"aliases": [
				"needs-photo"
			],
			"autovalue": "yes",
			"suggested": true
		}
	}
};

export default config;
// </nowiki>
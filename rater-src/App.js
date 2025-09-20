import setupRater from "./setup";
import autoStart from "./autostart";
import styles from "./css.js";
import { makeErrorMsg } from "./api";
import windowManager from "./windowManager";
import i18n from "./i18n";
// <nowiki>

function startApp() {
	let stylesheet;

	const showMainWindow = data => {
		if (!data || !data.success) {
			return;
		}
		if (stylesheet) {
			stylesheet.disabled = false;
		} else {
			stylesheet = mw.util.addCSS(styles);
		}
		// Add css class to body to enable background scrolling
		document.getElementsByTagName("body")[0].classList.add("rater-mainWindow-open");
		// Open the window
		windowManager.openWindow("main", data)
			.closed.then( result => {
				// Disable/remove the css styles, so as to not interfere with other scripts/content/OOUI windows
				if (stylesheet) { stylesheet.disabled = true; }
				document.getElementsByTagName("body")[0].classList.remove("rater-mainWindow-open");
				// Restart if needed
				if (result && result.restart) {
					windowManager.removeWindows(["main"])
						.then(setupRater)
						.then(showMainWindow, showSetupError);
					return;
				}
				// Show notification when saved successfully
				if (result && result.success) {
					const $message = $("<span>").append(
						$("<strong>").text(i18n.t("notify-saved"))
					);
					if (result.upgradedStub) {
						$message.append(
							$("<br>"),
							// TODO: There should be a link that will edit the article for you
							$("<span>").text(i18n.t("notify-stub"))
						);
					}
					mw.notify(
						$message,
						{ autoHide: true, autoHideSeconds: "long", tag: "Rater-saved" }
					);
				}
			} );
	};

	const showSetupError = (code, jqxhr) => OO.ui.alert(
		makeErrorMsg(code, jqxhr),	{
			title: i18n.t("app-setup-error")
		}
	);

	// Invocation by portlet link 
	mw.util.addPortletLink(
		"p-cactions",
		"#",
		i18n.t("app-portlet-text"),
		"ca-rater",
		i18n.t("app-portlet-tooltip"),
		"5"
	);
	$("#ca-rater").click(event => {
		event.preventDefault();
		setupRater().then(showMainWindow, showSetupError);
	});

	// Invocation by auto-start (do not show message on error)
	autoStart().then(showMainWindow);
}

// Ensure i18n is loaded before constructing UI so initial labels are localized
try {
	i18n.load().always(startApp);
} catch (e) {
	startApp();
}
// </nowiki>
import LoadDialog from "./Windows/LoadDialog";
import MainWindow from "./Windows/MainWindow";
// <nowiki>

var factory = new OO.Factory();

// Register window constructors with the factory.
factory.register(LoadDialog);
factory.register(MainWindow);

var manager = new OO.ui.WindowManager( {
	"factory": factory
} );
// Marker class, so CSS rules can target Rater's own windows without affecting
// other OOUI dialogs (e.g. OO.ui.confirm, which renders in #mw-teleport-target)
manager.$element.addClass( "rater-windowManager" );
$( document.body ).append( manager.$element );

export default manager;
// </nowiki>
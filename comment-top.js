// Disable error logging for this script
// There is a high volume of errors with the following error:
// Error: inheritClass: Origin is not a function (actually undefined)
// This can be removed when that has been addressed.
 mw.loader.using('mediawiki.storage').then(function () {
   mw.storage.session.set( 'client-error-opt-out', '1' );
 });

/*
 * Rater: dialog interface to add, remove, or modify WikiProject banners
 * Author: Evad37
 * Licence: MIT / CC-BY 4.0 [https://github.com/evad37/rater/blob/master/LICENSE]
 * 
 * Built from source code at GitHub repository [https://github.com/evad37/rater].
 * All changes should be made in the repository, otherwise they will be lost.
 * 
 * To update this script from github, you must have a local repository set up. Then
 * follow the instructions at [https://github.com/evad37/rater/blob/master/README.md]
 */
/* jshint esversion: 5, laxbreak: true, undef: true, eqnull: true, maxerr: 3000 */
/* globals console, document, window, $, mw, OO, extraJs */
/* <nowiki> */
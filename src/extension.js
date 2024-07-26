"use strict" ;
const vscode = require('vscode');

/**
 * @param {vscode.ExtensionContext} context
 */
function activate(context) {
	let disposable ;

	// * * * Menu BoDiapo * * *
	disposable = vscode.commands.registerCommand('bodiapo.bodiapoMenu', function () {
		require('./Menu/menu.js').menu(context) ;
	});

	// * * * Retaillage d'image * * *
	disposable = vscode.commands.registerCommand('bodiapo.retaillage', function () {
		require('./retaillage/retaillage.js').retaillage(context) ;
	});
	context.subscriptions.push(disposable);

}


// This method is called when your extension is deactivated
function deactivate() {}

module.exports = {
	activate,
	deactivate
}

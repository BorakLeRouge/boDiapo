const vscode = require('vscode');

/**
 * @param {vscode.ExtensionContext} context
 */
function activate(context) {

	// * * * Création d'un diaporama * * *
	let disposable = vscode.commands.registerCommand('bodiapo.bodiapo', function () {
		require('./page.js').affichPage(context) ;
	});
	context.subscriptions.push(disposable);

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

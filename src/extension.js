const vscode = require('vscode');

/**
 * @param {vscode.ExtensionContext} context
 */
function activate(context) {

	// * * * Menu BoDiapo * * *
	

	// * * * Création d'un diaporama * * *
	let disposable = vscode.commands.registerCommand('bodiapo.bodiapo', function () {
		require('./generationDiapo/page.js').affichPage(context) ;
	});
	context.subscriptions.push(disposable);

	// * * * Retaillage d'image * * *
	disposable = vscode.commands.registerCommand('bodiapo.retaillage', function () {
		require('./retaillage/retaillage.js').retaillage(context) ;
	});
	context.subscriptions.push(disposable);

	// * * * Retouche de la page Diapo * * *
	disposable = vscode.commands.registerCommand('bodiapo.retouchePageDiapo', function () {
		require('./retouchePage/retouchePage.js').retouchePage(context) ;
	});
	context.subscriptions.push(disposable);

}


// This method is called when your extension is deactivated
function deactivate() {}

module.exports = {
	activate,
	deactivate
}

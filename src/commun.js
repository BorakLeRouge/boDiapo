const vscode = require('vscode') ;
const fs     = require('fs') ;

let   lePanel ;


// * * * Clog * * *
const outputMngr    = require('./outputMngr.js') ;
// outputMngr.clogActivation() ;
function clog(...tb) { outputMngr.clog(tb) }

// * * * Un seul Panel d'affichage * * *
const panelRecup = function(context) {
    if (lePanel != undefined) {
        lePanel.dispose() ;
    }
    lePanel = vscode.window.createWebviewPanel(
        'boDiapo',
        'boDiapo',
        vscode.ViewColumn.One,
        {
          // Enable scripts in the webview
          enableScripts: true,
          // Garde le contenu quand la page est cachée
          retainContextWhenHidden: true,
          // Uri dans Webview ?
          asWebviewUri: true
        }
    );

    return lePanel ;
}

// * * * Si dossier non alimenté * * *
const siDossierAlimente = function(context) {
    let dossierCible = vscode.workspace.workspaceFolders[0].uri.fsPath ;
    let tbDossier = fs.readdirSync(dossierCible) ;
    return (tbDossier.includes('index.json') && tbDossier.includes('index.save') && tbDossier.includes('zoomimage.js')) ;
} 



module.exports = { panelRecup, siDossierAlimente } ;
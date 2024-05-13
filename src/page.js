// Require
const vscode        = require('vscode') ;
const path          = require('path') ;
const fs            = require('fs') ;

const outputMngr    = require('./outputMngr.js') ;
outputMngr.clogActivation() ;
function clog(...tb) { outputMngr.clog(tb) }


// Affichage de la page
exports.affichPage = function(context) {
    vscode.window.showInformationMessage('COUCOU') ;

    const panel = vscode.window.createWebviewPanel(
        'boDiapo',
        'boDiapo',
        vscode.ViewColumn.One,
        {
          // Enable scripts in the webview
          enableScripts: true,
          // Garde le contenu quand la page est cachée
          retainContextWhenHidden: true
        }
    );
    
    // * * * Alimentation du contenu html de base * * *
    panel.webview.html = preparationPageHtml(context, panel.webview);

    // * * * Gestion des messages entrants * * *
    panel.webview.onDidReceiveMessage(
        message => {
            switch (message.action) {
                case 'clog': {
                    clog('Interface', message.message) ;
                    break ;
                }
                case 'choisirDossier': {
                    choisirDossier(context, panel.webview) ;
                    break ;
                } 
                default : {
                    vscode.window.showErrorMessage('Message non traité : '+message.action);
                    break ;
                }
            }
        },
        undefined,
        context.subscriptions
    )

}
 

// * * * Préparation de la page * * *
function preparationPageHtml(context, webview) {
    let adrFich = path.join(context.extensionPath, 'src', 'page.html') ;
    let cheminW = webview.asWebviewUri(vscode.Uri.joinPath(context.extensionUri, 'src'));

    let contenuPage = fs.readFileSync(adrFich, 'utf-8') ;
    contenuPage = contenuPage.replaceAll('<chemin/>', cheminW) ;
    return contenuPage ;
}



// ================================================
//    A     CCC   TTTTT  III   OOO   N   N   SSS
//   A A   C   C    T     I   O   O  NN  N  S
//  A   A  C        T     I   O   O  N N N   SSS
//  AAAAA  C        T     I   O   O  N  NN      S
//  A   A  C   C    T     I   O   O  N   N      S
//  A   A   CCC     T    III   OOO   N   N  SSSS
// ================================================
// * * * Actions

async function choisirDossier(context, webview) {
    // Option d'ouverture
    const OpenDialogOptions = {
        canSelectMany: false,
        openLabel: 'Choisir Dossier d\'image',
        canSelectFiles: false,
        canSelectFolders: true
    };
    // Ouverture de dossier
    vscode.window.showOpenDialog(OpenDialogOptions).then(fileUri => {
        if (fileUri && fileUri[0]) {
            let dossier = fileUri[0].fsPath ;
            if (fs.existsSync(dossier)) {
                // Dossier sélectionné
                webview.postMessage({action: 'choisirDossier', dossier })
            }
        } else {
            vscode.window.showInformationMessage('Pas de dossier selectionné !') ;
        }
    });
}
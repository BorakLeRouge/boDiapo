// * * * Require * * * 
const vscode        = require('vscode') ;
const path          = require('path') ;
const fs            = require('fs') ;
const retailleImage = require('../retailleImage.js')

// * * * Clog * * *
const outputMngr    = require('../outputMngr.js') ;
outputMngr.clogActivation() ;
function clog(...tb) { outputMngr.clog(tb) }

// * * * Affichage de la page de saisie * * *
const retaillage = function(context) {
    const panel = vscode.window.createWebviewPanel(
        'reTaillage',
        'reTaillage',
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
                    clog('Interface clog', message.message) ;
                    break ;
                }
                case 'choisirImage': {
                    choisirImage(context, panel.webview) ;
                    break ;
                }
                case 'retaillage': {
                    retaillageImage({
                        context, 
                        fichier:        message.fichier,
                        taille:         message.taille,
                        rapport:        message.rapport,
                        quality:        message.quality
                }) ;
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
 module.exports = { retaillage } ;


 
// * * * Préparation de la page * * *
function preparationPageHtml(context, webview) {

    // Adresse de base
    let adrFich = path.join(context.extensionPath, 'src', 'retaillage' ,'page.html') ;
    let cheminW = webview.asWebviewUri(vscode.Uri.joinPath(context.extensionUri, 'src', 'retaillage'));
    let adrPage = path.join(context.extensionPath, 'src', 'retaillage', 'page') ; 

    // Préparation page
    let contenuPage = fs.readFileSync(adrFich, 'utf-8') ;
    contenuPage = contenuPage.replaceAll('<chemin/>', cheminW) ;
    return contenuPage ;

}

// * * * Choisir l'image à traiter * * *
async function choisirImage(context, webview) {
    // Option d'ouverture
    const OpenDialogOptions = {
        filters: {
            'Images': ['jpg', 'png', 'gif', 'webp', 'tif']
        },
        canSelectMany:      false,
        openLabel:          'Choisir une image',
        canSelectFiles:     true,
        canSelectFolders:   false,
        defaultUri:          vscode.workspace.workspaceFolders[0]?.uri
    };
    // Ouverture de dossier
    vscode.window.showOpenDialog(OpenDialogOptions).then(fileUri => {
        if (fileUri && fileUri[0]) {
            let image = fileUri[0].fsPath ;
            if (fs.existsSync(image)) {
                // Dossier sélectionné
                webview.postMessage({action: 'choisirImage', image })
            }
        } else {
            vscode.window.showInformationMessage('Pas d\'image selectionnée !') ;
        }
    });
}

// * * * Retailler l'image * * *
async function retaillageImage({context, fichier, taille, rapport, quality}) {
    source = fichier ;
    let decoup = path.parse(source) ;
    cible = path.join(decoup.dir, decoup.name + ' retail' + decoup.ext) ;
    // Traitement de l'image principale
    if (taille != '0') {
        await retailleImage.retailleImage({
            source:  source, 
            cible:   cible, 
            taille:  taille,
            type:    rapport, 
            quality: quality
        }) ;
    }
}
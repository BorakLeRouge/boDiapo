"use strict" ;
const vscode    = require('vscode') ;
const path      = require('path') ;
const fs        = require('fs') ;

const outputMngr    = require('../outputMngr.js') ;
outputMngr.clogActivation() ;
function clog(...tb) { outputMngr.clog(tb) }

// =================================================================================
//  M   M  EEEEE  N   N  U   U       BBB     OOO   DDD    III    A    PPPP    OOO
//  MM MM  E      NN  N  U   U       B  B   O   O  D  D    I    A A   P   P  O   O
//  M M M  EEE    N N N  U   U       BBBB   O   O  D   D   I   A   A  P   P  O   O
//  M   M  E      N  NN  U   U       B   B  O   O  D   D   I   AAAAA  PPPP   O   O
//  M   M  E      N   N  U   U       B   B  O   O  D  D    I   A   A  P      O   O
//  M   M  EEEEE  N   N   UUU        BBBB    OOO   DDD    III  A   A  P       OOO
// =================================================================================
// * * * Menu BoDiapo
const menu = async function(context) {



    // * * * Différent contrôle avant affichage * * *

    // Test si dossier vide
    let dossierCible = vscode.workspace.workspaceFolders[0].uri.fsPath ;
    if (!fs.lstatSync(dossierCible).isDirectory()) {
        vscode.window.showErrorMessage('Nous ne sommes pas dans un dossier !') ;
    }
    let tbDossier = fs.readdirSync(dossierCible) ;
    let siVide = (tbDossier.length == 0) ; clog(tbDossier.length, tbDossier) ;

    // Si Vide en va directement sur le générateur de Diapo
    if (siVide) {
        require('../generationDiapo/page.js').affichPage(context) ;
        return ;
    }

    // Test si dossier cible OK (avec index.json, index.save et zoomimage.js)
    let siDossierDiapo = (tbDossier.includes('index.json') && tbDossier.includes('index.save') && tbDossier.includes('zoomimage.js'))

    // pb dossier ? On continue ou pas (risque ecrasement)
    if (!siDossierDiapo) {
       // * * Liste déroulante : Le plus simple * *
        let result = await vscode.window.showQuickPick([
                { label: "Annuler", value: false },
                { label: "Continuer (risque d'écrasement du contenu)", value: true }
            ],
            {title: "Le dossier vsCode n'est pas vide et ce n'est pas un diaporama !"} 
        );  
        if (result == false) { return ; }
    }



    const panel = vscode.window.createWebviewPanel(
        'boDiapo Menu',
        'boDiapo Menu',
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
                case 'genererDiapo': {
                    genererDiapo(context) ;
                    panel.dispose() ;
                    break ;
                }
                case 'ajouterImages': {
                    ajouterImages(context) ;
                    // panel.dispose() ;
                    break ;
                }
                case 'reorganiser': {
                    reorganiser(context) ;
                    panel.dispose() ;
                    break ;
                }
                case 'visualiser': {
                    visualiser(dossierCible) ;
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


    vscode.window.showInformationMessage('Coucou') ;


    return  ;
}
module.exports = { menu } ;


function preparationPageHtml(context, webview) {
    // Adresse de base 
    let adrFich = path.join(context.extensionPath, 'src', 'Menu', 'menu.html') ;
    let cheminW = webview.asWebviewUri(vscode.Uri.joinPath(context.extensionUri, 'src', 'Menu'));

    // Préparation page
    let contenuPage = fs.readFileSync(adrFich, 'utf-8') ;
    contenuPage = contenuPage.replaceAll('<chemin/>', cheminW) ;
    return contenuPage ;
}

// * * * Actions * * *

function genererDiapo(context) {
    let module = require('../generationDiapo/page.js') ; 
    module.affichPage(context) ;
    return ;
}

function ajouterImages(context) {
    let module = require('../ajoutImages/page.js') ; 
    module.affichPage(context) ;
    return ;
}

function reorganiser(context) {
    let module = require('../retouchePage/retouchePage.js') ;
    module.retouchePage(context) ;
    return ;
}

function visualiser(dossierCible) {
    let visuFichier = vscode.Uri.file(path.join(dossierCible, 'index.html')) ;
    vscode.env.openExternal(visuFichier) ;
    return ;
}
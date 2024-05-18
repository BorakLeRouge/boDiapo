// Require
const vscode        = require('vscode') ;
const path          = require('path') ;
const fs            = require('fs') ;
const retailleImage = require('./retailleImage.js')

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
                case 'genererDiaporama': {
                    genererDiaporama(context, panel.webview, message) ;
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

// * * * Choisir le dossier cible * * * 

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

// * * * Générer le diaporama * * * 

async function genererDiaporama(context, webview, message)  {
    outputMngr.clear() ;
    outputMngr.affich('Traitement : Retaillage') ;

    // * dossier principal
    let dossierPrincipal = vscode.workspace.workspaceFolders[0].uri.fsPath ;

    // * Contenu du dossier image
    let fichiersImages = fs.readdirSync(message.dossier) ;

    // * contenu html
    let prep = '' ;

    let cpt = 0 ;
    // * Boucle sur les images
    for (let nomImg of fichiersImages) {
        let suff = nomImg.slice(-4).toLowerCase() ; 
        if (!['.jpg', '.gif', '.png', '.tif', 'webp'].includes(suff)) {
            continue ;
        }
        let fichImg = path.join(message.dossier, nomImg) ;
        cpt += 1 ;
        let newAlt  = 'image '+cpt ;
        let newImg  = 'image-'+('0000'+cpt).slice(-4)+'.jpg'
        let newVng  = 'vignette-'+('0000'+cpt).slice(-4)+'.jpg'
        let fichCib = path.join(dossierPrincipal, newImg) ;

        // Traitement de l'image principale
        await retailleImage.retailleImage(fichImg, fichCib, message.tailleI, 'Hauteur ou Largeur') ;
        
        // Traitement de la vignette
        fichCib = path.join(dossierPrincipal, newVng) ;
        await retailleImage.retailleImage(fichImg, fichCib, message.tailleV, message.tailleT) ;

        // Preparation contenu html
        prep += '<a href="'+newImg+'" class="zoomimage"><img src="'+newVng+'" alt="'+newAlt+'" class="photo" /></a>' + "\r\n" ;
    }

    // Preparation de la page
    alimentationPage(context, dossierPrincipal, message.titre, prep) ;
}

// * * * Alimentation restante du dossier, element html,css
function alimentationPage(context, dossierPrincipal, titre, prep) {
    let adrSource = path.join(context.extensionPath, 'src', 'page') ;

    // Preparation du fichier index.html
    let ficSou = path.join(adrSource, 'index.html') ;
    let ficCib = path.join(dossierPrincipal, 'index.html') ;
    let cont = fs.readFileSync(ficSou, 'utf8').replaceAll('**Titre**', titre).replaceAll('**Prep**', prep) ;
    fs.writeFileSync(ficCib, cont, 'utf8') ;

    // Recopie des autres fichiers

    let fichiers = fs.readdirSync(adrSource) ;
    for (let nomFic of fichiers) {
        if (nomFic == 'index.html' || nomFic.substring(0,1) == '.') { continue ; }
        ficSou = path.join(adrSource, nomFic) ;
        ficCib = path.join(dossierPrincipal, nomFic) ;
        fs.copyFileSync(ficSou, ficCib)
    }
}
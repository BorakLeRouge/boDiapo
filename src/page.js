// Require
const vscode        = require('vscode') ;
const path          = require('path') ;
const fs            = require('fs') ;
const retailleImage = require('./retailleImage.js')

const outputMngr    = require('./outputMngr.js') ;
//outputMngr.clogActivation() ;
function clog(...tb) { outputMngr.clog(tb) }

// Affichage de la page
exports.affichPage = function(context) {

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
                case 'visuResultat': {
                    visuResultat() ;
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
    // Adresse de base
    let adrFich = path.join(context.extensionPath, 'src', 'page.html') ;
    let cheminW = webview.asWebviewUri(vscode.Uri.joinPath(context.extensionUri, 'src'));
    let adrPage = path.join(context.extensionPath, 'src', 'page') ;

    // Récupération des types de présentation
    let optionsPres = '' ;
    let dossiersPres = fs.readdirSync(adrPage) ;
    for (let dossier of dossiersPres) {
        if (dossier.substring(0,1) != '.') {
            optionsPres += '<option>'+dossier+'</option>' ;
        }
    }

    // Préparation page
    let contenuPage = fs.readFileSync(adrFich, 'utf-8') ;
    contenuPage = contenuPage.replaceAll('<chemin/>', cheminW).replaceAll('<optionsPres/>', optionsPres) ;
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

    // Purge préparatoire
    purgeFichier(dossierPrincipal) ;

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
        if (message.tailleI != '0') {
            await retailleImage.retailleImage({
                source: fichImg, 
                cible: fichCib, 
                taille: message.tailleI,
                type: 'Hauteur ou Largeur'
            }) ;
        }
        
        // Traitement de la vignette
        if (message.tailleV != '0') {
            fichCib = path.join(dossierPrincipal, newVng) ;
            await retailleImage.retailleImage({
                source: fichImg, 
                cible: fichCib, taille: 
                message.tailleV, 
                type: message.tailleT}) ;
        }

        if (siZoomImageTitre(context, message.presentation)) {
            let titre = nom2Titre(nomImg) ;
            // Preparation contenu html avec titre
            prep += "\r\n" + '<span class="blocPhoto">' + "\r\n"  ;
            if (message.tailleI != '0' && message.tailleV != '0') {
                prep += '<a href="'+newImg+'" class="zoomimage"><img src="'+newVng+'" alt="'+newAlt+'" class="photo" /></a>' + "\r\n" ; 
            } else if (message.tailleI != '0'){
                prep += '<a href="'+newImg+'" class="zoomimage"><img src="'+newImg+'" alt="'+newAlt+'" class="photo" /></a>' + "\r\n" ; 
            } else if (message.tailleV != '0'){
                prep += '<a href="'+newVng+'" class="zoomimage"><img src="'+newVng+'" alt="'+newAlt+'" class="photo" /></a>' + "\r\n" ; 
            }
            prep += '<span class="comment">'+titre+'</span>' + "\r\n"  ;
            prep += '</span>' + "\r\n\r\n"  ;

        } else {
            // Preparation contenu html std
            if (message.tailleI != '0' && message.tailleV != '0') {
                prep += '<a href="'+newImg+'" class="zoomimage"><img src="'+newVng+'" alt="'+newAlt+'" class="photo" /></a>' + "\r\n" ; 
            } else if (message.tailleI != '0'){
                prep += '<a href="'+newImg+'" class="zoomimage"><img src="'+newImg+'" alt="'+newAlt+'" class="photo" /></a>' + "\r\n" ; 
            } else if (message.tailleV != '0'){
                prep += '<img src="'+newVng+'" alt="'+newAlt+'" class="photo" />' + "\r\n" ; 
            }
        }
    }

    // Preparation de la page
    alimentationPage(context, dossierPrincipal, message.titre, prep, message.fondColor, message.texteColor, message.presentation, message.retourHome) ;
}

// * * * Purge avant insertion

function purgeFichier(dossierPrincipal) {
    let fichiers = fs.readdirSync(dossierPrincipal) ;
    for (let nomFic of fichiers) {
        if (nomFic.substring(0,5) == 'index' || nomFic.substring(0,9) == 'zoomimage' || nomFic.substring(0,5) == 'image' || nomFic.substring(0,8) == 'vignette') { 
            let fich2delete = path.join(dossierPrincipal, nomFic) ;
            fs.unlinkSync(fich2delete) ; 
        }
    }  
}

// * * * Alimentation restante du dossier, element html,css
function alimentationPage(context, dossierPrincipal, titre, prep, fondColor, texteColor, presentation, retourHome) {
    // Préparation Variable
    let adrSource    = path.join(context.extensionPath, 'src', 'page', presentation) ;
    let adrZoomimage = path.join(context.extensionPath, 'src', 'zoomimage') ;

    // Si retourHome prévu
    let lienRetour = '' ;
    if (retourHome == 'Oui') {
        lienRetour = '<p class="retourhome"><a href="..">Retour.</a></p>' ;
    }

    // Preparation du fichier index.html
    let ficSou = path.join(adrSource,'index.html') ;
    let ficCib = path.join(dossierPrincipal, 'index.html') ;
    let ficSav = path.join(dossierPrincipal, 'index.save') ;
    let cont = fs.readFileSync(ficSou, 'utf8').replaceAll('**Titre**', titre).replaceAll('**Prep**', prep).replaceAll('**Retour**', lienRetour) ;
    fs.writeFileSync(ficCib, cont, 'utf8') ;
    fs.writeFileSync(ficSav, cont, 'utf8') ;

    // Preparation du fichier style.css
    ficSou = path.join(adrSource, 'index.css') ;
    ficCib = path.join(dossierPrincipal, 'index.css') ;
    cont = fs.readFileSync(ficSou, 'utf8').replaceAll('**fondColor**', fondColor).replaceAll('**texteColor**', texteColor) ;
    fs.writeFileSync(ficCib, cont, 'utf8') ;

    // Recopie des fichiers zoomimage
    let fichiers = fs.readdirSync(adrZoomimage) ;
    for (let nomFic of fichiers) {
        if (nomFic.substring(0,1) == '.') { continue ; }
        ficSou = path.join(adrZoomimage, nomFic) ;
        ficCib = path.join(dossierPrincipal, nomFic) ;
        fs.copyFileSync(ficSou, ficCib)
    }
}

// * * * Visualisation du résultat * * *
function visuResultat() {
    let fichierIndex = path.join(vscode.workspace.workspaceFolders[0].uri.fsPath, 'index.html') ;
    fichierIndex = vscode.Uri.file(fichierIndex) ;
    vscode.env.openExternal(fichierIndex) ;
}

// * * * Detection si titre * * *
function siZoomImageTitre(context, choixPage) {
    let adrPage = path.join(context.extensionPath, 'src', 'page') ;
    let fichIndex = path.join(adrPage, choixPage, 'index.html') ;
    let cont = fs.readFileSync(fichIndex, 'utf8') ;
    return cont.includes('zoomimageTitre.js') ;
}

// * * * Transformation nomfichier en titre * * *
function nom2Titre(nomDuFichier) {
    let p     = nomDuFichier.lastIndexOf(".") ; // pour retrait suffixe
    let titre = nomDuFichier.substring(0,p).replaceAll('_', ' ') ;
    return titre
}
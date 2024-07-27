// Require
const vscode        = require('vscode') ;
const path          = require('path') ;
const fs            = require('fs') ;
const retailleImage = require('../retailleImage.js')

const outputMngr    = require('../outputMngr.js') ;
//outputMngr.clogActivation() ;
function clog(...tb) { outputMngr.clog(tb) }

// Affichage de la page
exports.affichPage = async function(context) {

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
                case 'choisirImage': {
                    choisirImage(context, panel.webview) ;
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
    let adrFich = path.join(context.extensionPath, 'src', 'ajoutImages', 'page.html') ;
    let cheminW = webview.asWebviewUri(vscode.Uri.joinPath(context.extensionUri, 'src', 'ajoutImages'));
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
        openLabel: 'Choisir un Dossier d\'image à ajouter',
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

// * * * Choisir une image cible * * * 

async function choisirImage(context, webview) {
    // Option d'ouverture
    const OpenDialogOptions = {
        filters: {
            'Images': ['jpg', 'png', 'gif', 'webp', 'tif']
        },
        canSelectMany: false,
        openLabel: 'Choisir une image à ajouter',
        canSelectFiles: true,
        canSelectFolders: false
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
            vscode.window.showInformationMessage('Pas de dossier selectionné !') ;
        }
    });
}


// =====================================================================
//   GGG   EEEEE  N   N  EEEEE  RRRR     A    TTTTT  III   OOO   N   N
//  G   G  E      NN  N  E      R   R   A A     T     I   O   O  NN  N
//  G      EEE    N N N  EEE    R   R  A   A    T     I   O   O  N N N
//  G  GG  E      N  NN  E      RRRR   AAAAA    T     I   O   O  N  NN
//  G   G  E      N   N  E      R  R   A   A    T     I   O   O  N   N
//   GGGG  EEEEE  N   N  EEEEE  R   R  A   A    T    III   OOO   N   N
// =====================================================================
// * * * Générer le diaporama * * * 

async function genererDiaporama(context, webview, message)  {
    outputMngr.clear() ;
    outputMngr.affich('Traitement : Retaillage') ;

    // * dossier principal
    let dossierPrincipal = vscode.workspace.workspaceFolders[0].uri.fsPath ;

    // Récupération de JSON de paramètre
    let paramJson = path.join(dossierPrincipal, 'index.json') ;
    let param     = JSON.parse(fs.readFileSync(paramJson, 'utf-8')) ;

    // * * * Init * * *
    let prep = '' ;
    let cpt  = param.compteurImage ;

    // ========================================================================================
    //    A      JJJ   OOO   U   U  TTTTT       DDD     OOO    SSS    SSS   III  EEEEE  RRRR
    //   A A      J   O   O  U   U    T         D  D   O   O  S      S       I   E      R   R
    //  A   A     J   O   O  U   U    T         D   D  O   O   SSS    SSS    I   EEE    R   R
    //  AAAAA     J   O   O  U   U    T         D   D  O   O      S      S   I   E      RRRR
    //  A   A  J  J   O   O  U   U    T         D  D   O   O      S      S   I   E      R  R
    //  A   A   JJ     OOO    UUU     T         DDD     OOO   SSSS   SSSS   III  EEEEE  R   R
    // ========================================================================================
    // * * * Ajout DOSSIER
    if (message.dossier != '') {
        let fichiersImages = fs.readdirSync(message.dossier) ;

        // * contenu html

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
            if (param.tailleI != '0') {
                await retailleImage.retailleImage({
                    source: fichImg, 
                    cible:  fichCib, 
                    taille:  param.tailleI,
                    type:   'Hauteur ou Largeur'
                }) ;
            }
            
            // Traitement de la vignette
            if (param.tailleV != '0') {
                fichCib = path.join(dossierPrincipal, newVng) ;
                await retailleImage.retailleImage({
                    source:  fichImg, 
                    cible:   fichCib, 
                    taille:  param.tailleV, 
                    type:    param.tailleT}) ;
            }

            if (siZoomImageTitre(context, param.presentation)) {
                let titre = nom2Titre(nomImg) ;
                // Preparation contenu html avec titre
                prep += '<span class="blocPhoto">' ;
                if (param.tailleI != '0' && param.tailleV != '0') {
                    prep += '<a href="'+newImg+'" class="zoomimage"><img src="'+newVng+'" alt="'+newAlt+'" class="photo" /></a>' ; 
                } else if (message.tailleI != '0'){
                    prep += '<a href="'+newImg+'" class="zoomimage"><img src="'+newImg+'" alt="'+newAlt+'" class="photo" /></a>' ; 
                } else if (message.tailleV != '0'){
                    prep += '<a href="'+newVng+'" class="zoomimage"><img src="'+newVng+'" alt="'+newAlt+'" class="photo" /></a>' ; 
                }
                prep += '<span class="comment">'+titre+'</span>'  ;
                prep += '</span>' + "\r\n"  ;

            } else {
                // Preparation contenu html std
                if (param.tailleI != '0' && param.tailleV != '0') {
                    prep += '<a href="'+newImg+'" class="zoomimage"><img src="'+newVng+'" alt="'+newAlt+'" class="photo" /></a>' + "\r\n" ; 
                } else if (message.tailleI != '0'){
                    prep += '<a href="'+newImg+'" class="zoomimage"><img src="'+newImg+'" alt="'+newAlt+'" class="photo" /></a>' + "\r\n" ; 
                } else if (message.tailleV != '0'){
                    prep += '<img src="'+newVng+'" alt="'+newAlt+'" class="photo" />' + "\r\n" ; 
                }
            }
        }
    }

    // ===============================================================================================================
    //    A      JJJ   OOO   U   U  TTTTT       DDD     ,  U   U  N   N  EEEEE       III  M   M    A     GGG   EEEEE
    //   A A      J   O   O  U   U    T         D  D   ,   U   U  NN  N  E            I   MM MM   A A   G   G  E
    //  A   A     J   O   O  U   U    T         D   D      U   U  N N N  EEE          I   M M M  A   A  G      EEE
    //  AAAAA     J   O   O  U   U    T         D   D      U   U  N  NN  E            I   M   M  AAAAA  G  GG  E
    //  A   A  J  J   O   O  U   U    T         D  D       U   U  N   N  E            I   M   M  A   A  G   G  E
    //  A   A   JJ     OOO    UUU     T         DDD         UUU   N   N  EEEEE       III  M   M  A   A   GGGG  EEEEE
    // ===============================================================================================================
    // * * * Ajout d'une Image

    if (message.image != '') {
        let nomImg = path.basename(message.image) ; clog(nomImg) ;

        let suff = nomImg.slice(-4).toLowerCase() ; 
        if (['.jpg', '.gif', '.png', '.tif', 'webp'].includes(suff)) {
            let fichImg = message.image ;
            cpt += 1 ;
            let newAlt  = 'image '+cpt ;
            let newImg  = 'image-'+('0000'+cpt).slice(-4)+'.jpg'
            let newVng  = 'vignette-'+('0000'+cpt).slice(-4)+'.jpg'
            let fichCib = path.join(dossierPrincipal, newImg) ;

            // Traitement de l'image principale
            if (param.tailleI != '0') {
                await retailleImage.retailleImage({
                    source: fichImg, 
                    cible:  fichCib, 
                    taille:  param.tailleI,
                    type:   'Hauteur ou Largeur'
                }) ;
            }
            
            // Traitement de la vignette
            if (param.tailleV != '0') {
                fichCib = path.join(dossierPrincipal, newVng) ;
                await retailleImage.retailleImage({
                    source:  fichImg, 
                    cible:   fichCib, 
                    taille:  param.tailleV, 
                    type:    param.tailleT}) ;
            }

            if (siZoomImageTitre(context, param.presentation)) {
                let titre = nom2Titre(nomImg) ;
                // Preparation contenu html avec titre
                prep += '<span class="blocPhoto">' ;
                if (param.tailleI != '0' && param.tailleV != '0') {
                    prep += '<a href="'+newImg+'" class="zoomimage"><img src="'+newVng+'" alt="'+newAlt+'" class="photo" /></a>' ; 
                } else if (message.tailleI != '0'){
                    prep += '<a href="'+newImg+'" class="zoomimage"><img src="'+newImg+'" alt="'+newAlt+'" class="photo" /></a>' ; 
                } else if (message.tailleV != '0'){
                    prep += '<a href="'+newVng+'" class="zoomimage"><img src="'+newVng+'" alt="'+newAlt+'" class="photo" /></a>' ; 
                }
                prep += '<span class="comment">'+titre+'</span>'  ;
                prep += '</span>' + "\r\n"  ;

            } else {
                // Preparation contenu html std
                if (param.tailleI != '0' && param.tailleV != '0') {
                    prep += '<a href="'+newImg+'" class="zoomimage"><img src="'+newVng+'" alt="'+newAlt+'" class="photo" /></a>' + "\r\n" ; 
                } else if (message.tailleI != '0'){
                    prep += '<a href="'+newImg+'" class="zoomimage"><img src="'+newImg+'" alt="'+newAlt+'" class="photo" /></a>' + "\r\n" ; 
                } else if (message.tailleV != '0'){
                    prep += '<img src="'+newVng+'" alt="'+newAlt+'" class="photo" />' + "\r\n" ; 
                }
            }
        }
    }

    // =============================================================================================
    //  M   M    A      JJJ       DDD    EEEEE       L        A         PPPP     A     GGG   EEEEE
    //  MM MM   A A      J        D  D   E           L       A A        P   P   A A   G   G  E
    //  M M M  A   A     J        D   D  EEE         L      A   A       P   P  A   A  G      EEE
    //  M   M  AAAAA     J        D   D  E           L      AAAAA       PPPP   AAAAA  G  GG  E
    //  M   M  A   A  J  J        D  D   E           L      A   A       P      A   A  G   G  E
    //  M   M  A   A   JJ         DDD    EEEEE       LLLLL  A   A       P      A   A   GGGG  EEEEE
    // =============================================================================================
    // * * * Mise à jour de la page
    
    let fichierIndex = path.join(dossierPrincipal, 'index.html') ;
    let contenuIndex = fs.readFileSync(fichierIndex, 'utf-8')

    let p1 = contenuIndex.indexOf('<div class="blocimage">') ;
    let p2 = contenuIndex.indexOf('</div>',p1) ;

    let majContenu = contenuIndex.substring(0,p2) + prep +contenuIndex.substring(p2) ;
    fs.writeFileSync(fichierIndex, majContenu, 'utf-8') ;

    // maj et sauvegarde des parametres JSON
    param['compteurImage'] = cpt ;
    let ficParam = path.join(dossierPrincipal, 'index.json') ;
    fs.writeFileSync(ficParam, JSON.stringify(param), 'utf8') ;
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
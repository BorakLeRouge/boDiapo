"use strict"
// * * * Require * * * 
const vscode        = require('vscode') ;
const path          = require('path') ;
const fs            = require('fs') ;

// * * * Clog * * *
const outputMngr    = require('../outputMngr.js') ;
outputMngr.clogActivation() ;
function clog(...tb) { outputMngr.clog(tb) }

// ==========================================================================================
//  RRRR   EEEEE  TTTTT   OOO   U   U   CCC   H   H  EEEEE       PPPP     A     GGG   EEEEE
//  R   R  E        T    O   O  U   U  C   C  H   H  E           P   P   A A   G   G  E
//  R   R  EEE      T    O   O  U   U  C      HHHHH  EEE         P   P  A   A  G      EEE
//  RRRR   E        T    O   O  U   U  C      H   H  E           PPPP   AAAAA  G  GG  E
//  R  R   E        T    O   O  U   U  C   C  H   H  E           P      A   A  G   G  E
//  R   R  EEEEE    T     OOO    UUU    CCC   H   H  EEEEE       P      A   A   GGGG  EEEEE
// ==========================================================================================
// * * * Affichage de la page de saisie * * *
const retouchePage = function(context) {

    // * * * Controle si dépot de type diapo et chargement index * * *

    let dossierPrincipal = vscode.workspace.workspaceFolders[0].uri.fsPath ;
    let fichIndex = path.join(dossierPrincipal, 'index.html') ;
    if (!fs.existsSync(fichIndex)){
        vscode.window.showErrorMessage('Ce n\'est pas une page diaporama (pas de fichier index.html).') ;
        clog('Ce n\'est pas une page diaporama.') ;
        return ;
    }
    let contenu   = fs.readFileSync(fichIndex, 'utf-8') ;

    // * * * Pas de div boDiapo * * *
    if (!contenu.includes('<div class="blocimage">')) {
        vscode.window.showErrorMessage('Ce n\'est pas une page diaporama.') ;
        clog('Ce n\'est pas une page diaporama.') ;
        return ;
    }
 
    // * * * Extraction des informations * * *
    let lignes = contenuImage(contenu, dossierPrincipal) ;


    // ========================================================================================
    //  III  N   N  TTTTT  EEEEE  RRRR   FFFFF    A     CCC   EEEEE       W   W  EEEEE  BBB
    //   I   NN  N    T    E      R   R  F       A A   C   C  E           W   W  E      B  B
    //   I   N N N    T    EEE    R   R  FFF    A   A  C      EEE         W   W  EEE    BBBB
    //   I   N  NN    T    E      RRRR   F      AAAAA  C      E           W W W  E      B   B
    //   I   N   N    T    E      R  R   F      A   A  C   C  E           W W W  E      B   B
    //  III  N   N    T    EEEEE  R   R  F      A   A   CCC   EEEEE        W W   EEEEE  BBBB
    // ========================================================================================
    // * * * interface Web

    const panel = vscode.window.createWebviewPanel(
        'Retouche Page',
        'Retouche Page',
        vscode.ViewColumn.One,
        {
          // Enable scripts in the webview
          enableScripts: true,
          // Garde le contenu quand la page est cachée
          retainContextWhenHidden: true
        }
    );
    
    // * * * Alimentation du contenu html de base * * *
    panel.webview.html = preparationPageHtml(context, panel.webview, lignes);

    // * * * Gestion des messages entrants * * *
    panel.webview.onDidReceiveMessage(
        message => {
            switch (message.action) {
                case 'recupLignes': {
                    panel.webview.postMessage({action:'recupLignes', lignes: lignes})
                    break ;
                }
                case 'clog': {
                    clog('Interface clog', message.message) ;
                    break ;
                }
                default : {
                    vscode.window.showErrorMessage('Message non traité : '+message.action);
                    break ;
                }
            }
        },
        undefined,
        context.subscription 
    )
 }

 module.exports = { retouchePage } ;

// =============================================================================================================
//  PPPP   RRRR   EEEEE  PPPP     A    RRRR     A    TTTTT  III   OOO   N   N       H   H  TTTTT  M   M  L
//  P   P  R   R  E      P   P   A A   R   R   A A     T     I   O   O  NN  N       H   H    T    MM MM  L
//  P   P  R   R  EEE    P   P  A   A  R   R  A   A    T     I   O   O  N N N       HHHHH    T    M M M  L
//  PPPP   RRRR   E      PPPP   AAAAA  RRRR   AAAAA    T     I   O   O  N  NN       H   H    T    M   M  L
//  P      R  R   E      P      A   A  R  R   A   A    T     I   O   O  N   N       H   H    T    M   M  L
//  P      R   R  EEEEE  P      A   A  R   R  A   A    T    III   OOO   N   N       H   H    T    M   M  LLLLL
// =============================================================================================================
// * * * Préparation HTML
function preparationPageHtml(context, webview, lignes) {

    // Calcul de la liste
    let ret = '<table class="reduitImage">' ;
    for(let i in lignes) {
        let ligne = lignes[i] ;
        let cache = false ;
        let classCache = '' ;
        if (ligne.ligne.includes('<!-- ')) {
            cache = true ;
            classCache = 'cache' ;
        }
        ret += '<tr class="'+classCache+'"><td><img src="' + webview.asWebviewUri(vscode.Uri.parse(ligne.image)) + '" noligne="'+i+'" />' ;
        ret += '<td><p>Position : '+i ;
        if (cache) {
            ret += '</p><p><button onclick="montrer('+i+')">Montrer</button>' ;
        } else {
            ret += '</p><p><button onclick="cacher('+i+')">Cacher</button>' ;
        }
        ret += '</p><p><button onclick="deplacer('+i+')">Déplacer en position : </button> <input type="number" name="position" value="'+i+'"/>' ;
        ret += '<br /><button onclick="monter('+i+')">Monter</button> <button onclick="descendre('+i+')">Descendre</button>' ;
        ret += '</p></td>' ;
        ret += "</td></tr>\r\n" ;
    }
    ret += '</table>' ;

    // Adresse de base
    let adrFich = path.join(context.extensionPath, 'src', 'retouchePage' ,'page.html') ;
    let cheminW = webview.asWebviewUri(vscode.Uri.joinPath(context.extensionUri, 'src', 'retouchePage'));
    let adrPage = path.join(context.extensionPath, 'src', 'retaillage', 'page') ; 

    // Préparation page
    let contenuPage = fs.readFileSync(adrFich, 'utf-8') ;
    contenuPage = contenuPage.replaceAll('<chemin/>', cheminW).replaceAll('<insertion/>', ret) ;
    return contenuPage ;

}

// =========================================
//  L      III   GGG   N   N  EEEEE   SSS
//  L       I   G   G  NN  N  E      S
//  L       I   G      N N N  EEE     SSS
//  L       I   G  GG  N  NN  E          S
//  L       I   G   G  N   N  E          S
//  LLLLL  III   GGGG  N   N  EEEEE  SSSS
// =========================================
 // * * * Extraction des informations lignes * * *
 // En sortie : Tableau de lignes diapos  [{image, ligne}]
 function contenuImage(contenu, dossierPrincipal) {
    let p1 = contenu.indexOf('<div class="blocimage">') ;
    let p2 = contenu.indexOf('</div>', p1) ;
    contenu = contenu.substring(p1 + 23, p2).replaceAll("\r\n","\r").replaceAll("\n", "\r") ;
    let presVignette = contenu.includes('vignette-') ;
    let tab = contenu.split("\r") ;
    let retour = [] ;

    // * * Extraction des lignes * *
    for (let lign of tab) {
        if (lign.trim() != '') {
            let image ;
            if (presVignette) {
                p1 = lign.indexOf('vignette-') ;
            } else {
                p1 = lign.indexOf('image-') ;
            }
            p2 = lign.indexOf('"', p1) ;
            image = path.join(dossierPrincipal,lign.substring(p1, p2)) ;
            retour.push({image: image, ligne: lign}) ;
        }
    }
    return retour ;
 }
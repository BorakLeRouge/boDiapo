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
                case 'validation': {
                    validationModification(fichIndex, message.contenu) ;
                    break ;
                }
                case 'visualisation' : {
                    let visuFichier = vscode.Uri.file(fichIndex) ;
                    vscode.env.openExternal(visuFichier) ;
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
    let ret = '<table id="tableElt" class="reduitImage">' ;
    for(let i in lignes) {
        let ligne = lignes[i] ;
        let classCache = '' ;
        if (ligne.cache) {
            classCache = 'cache' ;
        }
        let ii = 1 + Number(i) ;
        ret += '<tr id="pos'+i+'" class="'+classCache+'" position="'+i+'">' ;
        ret += '<td>' + ii + '</td>'
        ret += '<td><img src="' + webview.asWebviewUri(vscode.Uri.parse(ligne.image)) + '" /></td>' ;
        ret += '<td><p><button onclick="montrerCacher('+i+')">Montrer/Cacher</button>' ;
        ret += '</p><p><button onclick="deplacer('+i+')">Déplacer en position : </button> <input type="number" name="position" value="'+ii+'"/>' ;
        ret += '<br /><button onclick="deplacer('+i+',\'H\')">Monter</button> <button onclick="deplacer('+i+',\'B\')">Descendre</button>' ;
        ret += '</p></td>' ;
        ret += "</td></tr>" ;
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
            let cache = false ;
            if (lign.includes('<!-- ')) {
                cache = true ;
                lign = lign.replaceAll('<!--', '').replaceAll('-->', '')
            }
            let image ;
            if (presVignette) {
                p1 = lign.indexOf('vignette-') ;
            } else {
                p1 = lign.indexOf('image-') ;
            }
            p2 = lign.indexOf('"', p1) ;
            image = path.join(dossierPrincipal,lign.substring(p1, p2)) ;
            retour.push({image: image, ligne: lign.trim(), cache: cache}) ;
        }
    }
    return retour ;
 }

 // ======================================================================================================================================================
 //  V   V    A    L      III  DDD      A    TTTTT  III   OOO   N   N       M   M   OOO   DDD    III  FFFFF  III   CCC     A    TTTTT  III   OOO   N   N
 //  V   V   A A   L       I   D  D    A A     T     I   O   O  NN  N       MM MM  O   O  D  D    I   F       I   C   C   A A     T     I   O   O  NN  N
 //  V   V  A   A  L       I   D   D  A   A    T     I   O   O  N N N       M M M  O   O  D   D   I   FFF     I   C      A   A    T     I   O   O  N N N
 //   V V   AAAAA  L       I   D   D  AAAAA    T     I   O   O  N  NN       M   M  O   O  D   D   I   F       I   C      AAAAA    T     I   O   O  N  NN
 //   V V   A   A  L       I   D  D   A   A    T     I   O   O  N   N       M   M  O   O  D  D    I   F       I   C   C  A   A    T     I   O   O  N   N
 //    V    A   A  LLLLL  III  DDD    A   A    T    III   OOO   N   N       M   M   OOO   DDD    III  F      III   CCC   A   A    T    III   OOO   N   N
 // ======================================================================================================================================================
 // * * * Validation modification
function validationModification(fichIndex, contenu) {

    // Lecture du fichier index
    let cont = fs.readFileSync(fichIndex, 'utf-8') ;

    // Réinsertion du contenu
    let p1 = cont.indexOf('<div class="blocimage">') ;
    let p2 = cont.indexOf('</div>', p1) ;
    cont = cont.substring(0, p1) + '<div class="blocimage">' + "\r\n" + contenu + cont.substring(p2) ;

    // Ecriture du fichier index
    fs.writeFileSync(fichIndex, cont, 'utf-8') ;

    // Message
    vscode.window.showInformationMessage('Mise à jour effectuée !')

}
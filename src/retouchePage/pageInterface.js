// * * * Gestion de l'interface
const vscode = acquireVsCodeApi() ;


// ==============================================================
//  RRRR   EEEEE   CCC   EEEEE  PPPP   TTTTT  III   OOO   N   N
//  R   R  E      C   C  E      P   P    T     I   O   O  NN  N
//  R   R  EEE    C      EEE    P   P    T     I   O   O  N N N
//  RRRR   E      C      E      PPPP     T     I   O   O  N  NN
//  R  R   E      C   C  E      P        T     I   O   O  N   N
//  R   R  EEEEE   CCC   EEEEE  P        T    III   OOO   N   N
// ==============================================================
// * * * Reception du script VsCode

let infoLignes = '' ;

// * * * Reception Messages envoyés par la partie VSCode de l'application
window.addEventListener('message', event => {
    const message = event.data ;
    // * * * Récupération de la description des lignes * * *
    if (message.action == 'recupLignes') {
        infoLignes = message.lignes ;
    }
} )

// * * * Récupération de la liste des lignes * * *
vscode.postMessage({action: 'recupLignes'}) ;


// ================================================
//    A     CCC   TTTTT  III   OOO   N   N   SSS
//   A A   C   C    T     I   O   O  NN  N  S
//  A   A  C        T     I   O   O  N N N   SSS
//  AAAAA  C        T     I   O   O  N  NN      S
//  A   A  C   C    T     I   O   O  N   N      S
//  A   A   CCC     T    III   OOO   N   N  SSSS
// ================================================
// * * * Actions


// * * * Action Montrer/Cacher * * *
function montrerCacher(pos) {
    let id = 'pos' + pos ;
    let tr = document.getElementById(id) ;
    if (tr.className.includes('cache')) {
        tr.className = '' ;
    } else {
        tr.className = 'cache' ;
    }
}


// * * * Déplacer les lignes * * *
function deplacer(pos, direction='') {
    console.log('direction', direction)
    // * * Lignes de base * *
    let id = 'pos' + pos ;
    let tr = document.getElementById(id) ;
    // * * Si "Bas" * *
    if (direction == 'B') {
        let suivant = tr.nextSibling  ;
        if (suivant == undefined) { return ; }
        suivant.insertAdjacentElement('afterend', tr) ;
        renumerote() ;
    }
    // * * Si "Haut" * *
    if (direction == 'H') {
        let preced = tr.previousSibling  ;
        if (preced == undefined) { return ; }
        preced.insertAdjacentElement('beforebegin', tr) ;
        renumerote() ;
    }
    // * * Si déplacement * *
    if (direction == '') {
        
    }
}

// * * * Renumérote * * *
function renumerote() {
    let tb = document.getElementById('tableElt') ;
    let tbTr = tb.getElementsByTagName('TR') ;
    let cpt = 0 ;
    for (let tr of tbTr) {
        cpt = cpt + 1 ;
        tr.firstChild.innerHTML = cpt ;
    }
}

// =========================================
//  DDD    III  V   V  EEEEE  RRRR    SSS
//  D  D    I   V   V  E      R   R  S
//  D   D   I   V   V  EEE    R   R   SSS
//  D   D   I    V V   E      RRRR       S
//  D  D    I    V V   E      R  R       S
//  DDD    III    V    EEEEE  R   R  SSSS
// =========================================
// * * * Divers

// * * * Fonction CLOG à regroupement * * *
function clog(...tb) {
    vscode.postMessage({
        action:  'clog', 
        message: tb
    }) ;
}
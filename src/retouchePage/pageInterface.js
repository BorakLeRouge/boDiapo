// * * * Script Interface.js * * * * * * * * * * *
let infoLignes = '' ;

// * * * Gestion de l'interface
const vscode = acquireVsCodeApi() ;

// * * * Reception Messages envoyés par la partie VSCode de l'application
window.addEventListener('message', event => {
    const message = event.data ;
    if (message.action == 'recupLignes') {
        infoLignes = message.lignes ;
        clog('infoLignes', infoLignes) ;
    }
} )

// * * * Récupération de la liste des lignes * * *
vscode.postMessage({action: 'recupLignes'}) ;
clog('coucou')

// * * * Fonction CLOG à regroupement * * *
function clog(...tb) {
    vscode.postMessage({
        action:  'clog', 
        message: tb
    }) ;
}
// * * * Script Interface.js * * * * * * * * * * *
let dossier = '' ;

// * * * Gestion de l'interface
const vscode = acquireVsCodeApi() ;

// * * * Reception Messages envoyés par la partie VSCode de l'application
window.addEventListener('message', event => {
    const message = event.data ;
    if (message.action == 'choisirDossier') {
        dossier = message.dossier ;
        document.getElementById('dossier').innerHTML = dossier ;
    }
} )

// * * * Actions * * *
function choisirDossier() {
    vscode.postMessage({action: 'choisirDossier'})
}





// * * * Fonction CLOG à regroupement * * *
clog('Interface active.');
function clog(...tb) {
    vscode.postMessage({
        action:  'clog', 
        message: tb
    }) 
}
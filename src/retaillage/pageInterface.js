// * * * Script Interface.js * * * * * * * * * * *
let image = '' ;

// * * * Gestion de l'interface
const vscode = acquireVsCodeApi() ;
// * * * Reception Messages envoyés par la partie VSCode de l'application
window.addEventListener('message', event => {
    const message = event.data ;
    if (message.action == 'choisirImage') {
        image = message.image ;
        document.getElementById('image').innerHTML = image ;
        document.getElementById('retailleBtn').removeAttribute("disabled") ;
    }
} )

// * * * Actions * * *
function choisirImage() {
    vscode.postMessage({action: 'choisirImage'}) ;
}

function demandeRetaillage() {
    let taille       = document.getElementById('taille').value ;
    let rapport      = document.getElementById('rapport').value ;
    let remplacement = document.getElementById('remplacement').value ;
    vscode.postMessage({
        action: 'retaillage',
        fichier: image,
        taille, rapport, remplacement
    }) ;
    image = '' ;
    document.getElementById('image').innerHTML = '' ;
    document.getElementById('retailleBtn').setAttribute("disabled", "disabled") ;
}

// * * * Fonction CLOG à regroupement * * *
function clog(...tb) {
    vscode.postMessage({
        action:  'clog', 
        message: tb
    }) ;
}
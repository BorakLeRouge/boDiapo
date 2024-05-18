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
        document.getElementById('generateBtn').removeAttribute("disabled") ;
    }
} )

// * * * Actions * * *
function choisirDossier() {
    vscode.postMessage({action: 'choisirDossier'})
}

function genererDiaporama() {
    let tailleV = document.getElementById('tailleV').value ;
    let tailleI = document.getElementById('tailleI').value ;
    let tailleT = document.getElementById('tailleT').value ;
    let titre   = document.getElementById('titre').value ;
    vscode.postMessage({action: 'genererDiaporama'
        , tailleV, tailleI, tailleT, dossier, titre
    }) ;
}



// * * * Fonction CLOG à regroupement * * *
clog('Interface active.');
function clog(...tb) {
    vscode.postMessage({
        action:  'clog', 
        message: tb
    }) 
}
// * * * Script Interface.js * * * * * * * * * * *
let dossier = '' ;
let image   = '' ;

// * * * Gestion de l'interface
const vscode = acquireVsCodeApi() ;

// * * * Reception Messages envoyés par la partie VSCode de l'application
window.addEventListener('message', event => {
    const message = event.data ;
    if (message.action == 'choisirDossier') {
        dossier = message.dossier ;
        document.getElementById('dossier').innerHTML = dossier ;
        document.getElementById('generateBtn').removeAttribute("disabled") ;
        document.getElementById('visuResultat').removeAttribute("disabled") ;
    }
    if (message.action == 'choisirImage') {
        image = message.image ;
        document.getElementById('image').innerHTML = image ;
        document.getElementById('generateBtn').removeAttribute("disabled") ;
        document.getElementById('visuResultat').removeAttribute("disabled") ;
    }
} )

// * * * Actions * * *
function choisirDossier() {
    vscode.postMessage({action: 'choisirDossier'})
}

function choisirImage() {
    vscode.postMessage({action: 'choisirImage'})
}

function genererDiaporama() {
    document.getElementById('generateBtn').setAttribute("disabled","disabled") ;
    vscode.postMessage({
        action: 'genererDiaporama', 
        dossier, image
    }) ;
}

function visuResultat() {
    vscode.postMessage({action: 'visuResultat'})
}

function retourMenu() {
    vscode.postMessage({action: 'retourMenu'})
}

// * * * Fonction CLOG à regroupement * * *
clog('Interface active.');
function clog(...tb) {
    vscode.postMessage({
        action:  'clog', 
        message: tb
    }) 
}
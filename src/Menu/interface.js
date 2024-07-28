// * * * Script Interface.js * * * * * * * * * * *

// * * * Gestion de l'interface
const vscode = acquireVsCodeApi() ;


// * * * Actions * * *
function genererDiapo() {
    vscode.postMessage({action: 'genererDiapo'})
}
function ajouterImages() {
    vscode.postMessage({action: 'ajouterImages'})
}
function reorganiser() {
    vscode.postMessage({action: 'reorganiser'})
}
function visualiser() {
    vscode.postMessage({action: 'visualiser'})
}

// * * * Fonction CLOG à regroupement * * *
function clog(...tb) {
    vscode.postMessage({
        action:  'clog', 
        message: tb
    }) 
}
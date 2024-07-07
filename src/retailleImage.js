const vscode = require('vscode');
const sharp  = require('sharp');
const fs     = require('fs');
const path   = require('path');

const outputMngr    = require('./outputMngr.js') ;
function clog(...tb) { outputMngr.clog(tb) }


const retailleImage = async function({source, cible, taille, type}) {
    // Retaillage d'une Image en JPG
    // - source : Fichier en entrée
    // - cible  : Fichier en sortie
    // - Taille maximum de l'image (valeur ou 'sans')
    // - Maximum pour : 'hauteur', 'largeur', 'hauteur ou largeur'

    outputMngr.affich('preparation : '+path.basename(source) + ' -> ' + path.basename(cible)) ;
    let image ;
    try {
        image =  await sharp(source).metadata() ;
    } catch(e) {
        clog('Anomalie', e) ;
        return
    }

    let hb = image.height ;
    let wb = image.width ;
    let h = Math.round(hb) ;
    let w = Math.round(wb) ;
    // Calcul taille cible
    if (!taille.toLowerCase().includes('sans')) {
        if (type.toLowerCase().includes('largeur')) {
            if (w > Math.round(taille)) {
                w = Math.round(taille) ;
                h = Math.round(hb * w / wb) ;
            }
        }
        if (type.toLowerCase().includes('hauteur')) {
            if (h > Math.round(taille)) {
                h = Math.round(taille) ;
                w = Math.round(wb * h / hb) ; 
            }
        }
    }

    // Alimentation du fichier
    try {
        await sharp(source)
        .resize(w, h)
        .toFormat('jpeg')
        .jpeg({quality: 65})
        .toFile(cible)
        ;
    } catch(e) {
        clog('Anomalie', e) ;
        return
    }


}

module.exports = {
	retailleImage
}
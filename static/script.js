// --- Récupération des éléments HTML ---
const menu = document.getElementById("menu");            // Écran du menu principal
const hud = document.getElementById("hud");              // HUD (score + chrono)
const bouton = document.getElementById("bouton-fuyant"); // Le bouton qui fuit
const fin = document.getElementById("fin");              // Écran de fin

// Boutons du menu
const startBtn = document.getElementById("start-btn");     // Bouton "Jouer"
const restartBtn = document.getElementById("restart-btn"); // Bouton "Rejouer"
const resetBtn = document.getElementById("reset-btn");     // Bouton "Reset High Score"

// Éléments du score / chrono
const scoreEl = document.getElementById("score");        // Score en cours
const chronoEl = document.getElementById("chrono");      // Chronomètre
const bestEl = document.getElementById("best");          // Meilleur score sauvegardé

// Texte de l'écran de fin
const finalScore = document.getElementById("final-score"); 
const finalBest = document.getElementById("final-best");


// --- Variables du jeu ---
let score = 0;       // Score du joueur
let temps = 10;      // Temps du chronomètre
let jeuActif = false; // Indique si la partie est en cours
let timer;            // Stocke le setInterval du chrono


// --- Chargement du meilleur score via localStorage ---
let meilleurScore = localStorage.getItem("meilleurScore") || 0;
bestEl.textContent = "Meilleur : " + meilleurScore;


// --- Paramètres du bouton impossible ---
let zoneFuite = 250;     // Distance à laquelle le bouton commence à fuir
let vitesseBase = 120;   // Vitesse normale
let vitesseMax = 380;    // Vitesse maximale
let vitesse = vitesseBase; // Vitesse actuelle


// --- Fonction pour placer le bouton au centre de l'écran ---
function placerBouton() {
    bouton.style.left = window.innerWidth / 2 - bouton.offsetWidth / 2 + "px";
    bouton.style.top = window.innerHeight / 2 - bouton.offsetHeight / 2 + "px";
}


// --- Fonction pour démarrer une partie ---
function demarrerJeu() {
    menu.style.display = "none"; // Cacher le menu
    fin.style.display = "none";  // Cacher l'écran de fin
    hud.style.display = "flex";  // Afficher le HUD
    bouton.style.display = "block"; // Afficher le bouton fuyant

    score = 0;      // Réinitialiser score
    temps = 10;     // Remettre le chrono à 10
    vitesse = vitesseBase; // Réinitialiser vitesse

    // Mettre à jour l'affichage
    scoreEl.textContent = "Score : 0";
    chronoEl.textContent = "Temps : 10";

    jeuActif = true;      // Le jeu commence
    placerBouton();       // Placer le bouton au centre

    // --- Lancer le chronomètre ---
    timer = setInterval(() => {

        temps--; // Décrémenter le temps
        chronoEl.textContent = "Temps : " + temps; // Mettre à jour l'affichage

        // Si le temps est fini → fin du jeu
        if (temps <= 0) {
            terminerJeu();
        }

    }, 1000); // Toutes les 1 seconde
}


// --- Fonction de fin du jeu ---
function terminerJeu() {
    jeuActif = false;   // On arrête le jeu
    clearInterval(timer); // On arrête le chrono

    bouton.style.display = "none"; // Cacher le bouton
    hud.style.display = "none";    // Cacher HUD

    // Mise à jour du meilleur score si nécessaire
    if (score > meilleurScore) {
        meilleurScore = score;
        localStorage.setItem("meilleurScore", meilleurScore);
    }

    // Remplir l'écran de fin
    finalScore.textContent = "Score : " + score;
    finalBest.textContent = "Meilleur : " + meilleurScore;

    // Afficher l'écran de fin
    fin.style.display = "block";
}



// --- Gestion du mouvement du bouton qui fuit ---
document.addEventListener("mousemove", (e) => {

    if (!jeuActif) return; // Si le jeu n'est pas actif → ignorer

    const rect = bouton.getBoundingClientRect(); // Coordonnées du bouton
    const bx = rect.left + rect.width / 2;       // Centre X du bouton
    const by = rect.top + rect.height / 2;       // Centre Y du bouton

    const dx = e.clientX - bx; // Distance souris → bouton en X
    const dy = e.clientY - by; // Distance souris → bouton en Y
    const distance = Math.sqrt(dx*dx + dy*dy); // Distance réelle

    // Si on s'approche du bouton → fuite
    if (distance < zoneFuite) {

        score++; // +1 point pour s'être approché
        if (bouton.addEventListener)("click", () => {
            score+100;
        });
        scoreEl.textContent = "Score : " + score;

        // Le bouton accélère de plus en plus
        vitesse = Math.min(vitesse * 1.1, vitesseMax);

        // Le bouton ANTICIPE ta trajectoire
        const predX = e.clientX + dx * 0.3;
        const predY = e.clientY + dy * 0.3;

        // Calcul direction de fuite
        const angle = Math.atan2(predY - by, predX - bx);

        let newX = bx - Math.cos(angle) * vitesse;
        let newY = by - Math.sin(angle) * vitesse;

        // Empêcher de sortir de l'écran
        newX = Math.max(0, Math.min(window.innerWidth - rect.width, newX));
        newY = Math.max(0, Math.min(window.innerHeight - rect.height, newY));

        // Appliquer le déplacement final
        bouton.style.left = newX - rect.width / 2 + "px";
        bouton.style.top = newY - rect.height / 2 + "px";

        // Si tu es vraiment trop proche → téléportation !
        if (distance < 50) {
            bouton.style.left = Math.random() * (window.innerWidth - rect.width) + "px";
            bouton.style.top = Math.random() * (window.innerHeight - rect.height) + "px";

            bouton.style.opacity = 0;      // Devient invisible
            setTimeout(() => bouton.style.opacity = 1, 200); // Reviens après 0.2s
        }
    }
});


// --- Boutons du menu ---
startBtn.addEventListener("click", demarrerJeu);  // Commencer une partie
restartBtn.addEventListener("click", demarrerJeu); // Rejouer après la fin


// --- Reset High Score ---
resetBtn.addEventListener("click", () => {
    localStorage.setItem("meilleurScore", 0); // Remise à zéro
    meilleurScore = 0;
    bestEl.textContent = "Meilleur : 0"; // Mise à jour immédiate
    alert("High Score réinitialisé !");
});

const gameArea = document.getElementById('gameArea');
const scoreSpan = document.getElementById('score');
const levelSpan = document.getElementById('level');
const startScreen = document.getElementById('startScreen');
const playBtn = document.getElementById('playBtn');
const pauseBtn = document.getElementById('pauseBtn');
const gameContainer = document.getElementById('gameContainer');

let score = 0;
let level = 1;
let lives = 10;
const pointsPerLevel = 30;
let activeAliens = [];
let paused = false;
let running = false;
let animationId = null;

const alienChars = [
    // Grundreihe, Start mit Zeigefinger-Kombination
    ['j', 'f'],                                  // 1: beide Zeigefinger
    ['j', 'f', 'k'],                             // 2: rechter Mittelfinger dazu
    ['j', 'f', 'd', 'k'],                        // 3: linker Mittelfinger dazu
    ['j', 'f', 'd', 'k', 'l'],                   // 4: rechter Ringfinger dazu
    ['j', 'f', 'd', 'k', 'l', 's'],              // 5: linker Ringfinger dazu
    ['j', 'f', 'd', 'k', 'l', 's', 'a'],         // 6: linker kleiner Finger dazu
    ['j', 'f', 'd', 'k', 'l', 's', 'a', 'ö'],    // 7: rechter kleiner Finger dazu
    ['a', 's', 'd', 'f', 'j', 'k', 'l', 'ö'],    // 8: komplette Grundreihe

    // Obere Reihe, Zeigefinger und Mittelfinger einzeln und in Kombination
    ['f', 'j', 'r', 'u'],                        // 9: Zeigefinger obere Reihe
    ['f', 'j', 'r', 'u', 'e'],                   // 10: linker Mittelfinger obere Reihe
    ['f', 'j', 'r', 'u', 'e', 'i'],              // 11: rechter Mittelfinger obere Reihe
    ['f', 'j', 'r', 'u', 'e', 'i', 'w'],         // 12: linker Ringfinger obere Reihe
    ['f', 'j', 'r', 'u', 'e', 'i', 'w', 'o'],    // 13: rechter Ringfinger obere Reihe
    ['f', 'j', 'r', 'u', 'e', 'i', 'w', 'o', 'q'], // 14: linker kleiner Finger obere Reihe
    ['f', 'j', 'r', 'u', 'e', 'i', 'w', 'o', 'q', 'p'], // 15: rechter kleiner Finger obere Reihe
    ['a', 's', 'd', 'f', 'j', 'k', 'l', 'ö', 'r', 'u', 'e', 'i', 'w', 'o', 'q', 'p'], // 16: Grund- und obere Reihe komplett

    // Untere Reihe Schritt für Schritt
    ['v'],                                        // 17: linker Zeigefinger untere Reihe
    ['v', 'n'],                                   // 18: beide Zeigefinger untere Reihe
    ['v', 'n', 'c'],                              // 19: linker Mittelfinger untere Reihe
    ['v', 'n', 'c', 'm'],                         // 20: rechter Mittelfinger untere Reihe

   // Untere Reihe komplettieren
    ['v', 'n', 'c', 'm', 'x'],                  // 21: linker kleiner Finger untere Reihe
    ['v', 'n', 'c', 'm', 'x', 'y'],             // 22: rechter kleiner Finger untere Reihe
    ['v', 'n', 'c', 'm', 'x', 'y', 'b'],        // 23: beide Daumen/Buchstaben untere Reihe
    ['v', 'n', 'c', 'm', 'x', 'y', 'b', ','],   // 24: Komma dazu
    ['v', 'n', 'c', 'm', 'x', 'y', 'b', ',', '.'], // 25: Punkt dazu
    ['v', 'n', 'c', 'm', 'x', 'y', 'b', ',', '.', '-'], // 26: Bindestrich dazu

    // Umlaute und Sonderzeichen
    ['ä', 'ü', 'ß'],                            // 27: Umlaute und scharfes S
    [';', ':', '!', '?'],                       // 28: erste Satzzeichen

    // Zahlenreihe
    ['1', '2', '3', '4', '5', '6', '7', '8', '9', '0'], // 29: Zahlenreihe

    // Einfache Wörter und erste Sätze
    ['hallo', 'test', 'fisch', 'hund', 'katze', 'auto', 'haus', 'buch', 'das ist ein test', 'ich lerne tippen', 'die katze läuft', 'heute ist sonntag'] // 30: Wörter und Sätze
];


function spawnAlien() {
    const chars = alienChars[level - 1] || alienChars[alienChars.length - 1];
    const char = chars[Math.floor(Math.random() * chars.length)];
    const alien = document.createElement('div');
    alien.className = 'alien';
    alien.innerHTML = `
      <img src="alien-ship.svg" alt="Alien Ship" width="40" height="40" style="display:block;margin:auto;">
      <div class="alien-text">${char}</div>
    `;
    alien.style.position = 'absolute';
    alien.style.top = `${Math.random() * (gameArea.clientHeight - 50)}px`;
    alien.style.left = '0px';
    // Geschwindigkeit wächst im Level: Startwert + Anteil Score/Level
    let speed = 1 + level * 0.3 + (score / pointsPerLevel) * 2; // z.B. bis zu 2.3 schneller am Levelende
    activeAliens.push({ el: alien, char, x: 0, speed: speed, matched: "" });
    gameArea.appendChild(alien);
}

function moveAliens() {
    for (let i = activeAliens.length - 1; i >= 0; i--) {
        let alien = activeAliens[i];
        alien.x += alien.speed;
        alien.el.style.left = `${alien.x}px`;
        if (alien.x > gameArea.clientWidth) {
            gameArea.removeChild(alien.el);
            activeAliens.splice(i, 1);
            lives--;
            document.getElementById('lives').textContent = lives;
            if (lives <= 0) {
                endGame();
                return;
            }
        }
    }
}

function endGame() {
    running = false;
    paused = false;
    cancelAnimationFrame(animationId);
    alert('Spiel vorbei! Du hast keine Leben mehr.');
    // Reset: Zurück zum Startbildschirm
    gameContainer.style.display = "none";
    startScreen.style.display = "flex";
}

function gameLoop() {
    if (!paused && running) {
        moveAliens();
        if (Math.random() < 0.02 * level) spawnAlien();
    }
    animationId = requestAnimationFrame(gameLoop);
}

function handleKeydown(e) {
    if (!running || paused) return;
    let key = e.key.toLowerCase();
    for (let i = 0; i < activeAliens.length; i++) {
        let alien = activeAliens[i];
        // Einzelbuchstaben-Level
        if (alien.char.length === 1 && alien.char === key) {
            score++;
            scoreSpan.textContent = score;
            gameArea.removeChild(alien.el);
            activeAliens.splice(i, 1);
            checkLevel();
            break;
        }
        // Wort-Level (einfach: jedes Wort muss von vorne komplett getippt werden)
        if (alien.char.length > 1) {
            if (!alien.matched && key === alien.char[0]) {
                alien.matched = key;
                alien.el.innerHTML = `<span style="color:yellow">${key}</span>${alien.char.slice(1)}`;
            } else if (alien.matched && key === alien.char[alien.matched.length]) {
                alien.matched += key;
                alien.el.innerHTML = `<span style="color:yellow">${alien.matched}</span>${alien.char.slice(alien.matched.length)}`;
                if (alien.matched === alien.char) {
                    score++;
                    scoreSpan.textContent = score;
                    gameArea.removeChild(alien.el);
                    activeAliens.splice(i, 1);
                    checkLevel();
                }
            }
            break;
        }
    }
}

function checkLevel() {
    if (score >= pointsPerLevel) {
        level++;
        score = 0;
        levelSpan.textContent = level;
        scoreSpan.textContent = score;
        // Entferne alle Aliens
        activeAliens.forEach(a => gameArea.removeChild(a.el));
        activeAliens = [];
        alert('Level up!');
    }
}

// Pause/Resume Handler
pauseBtn.addEventListener('click', () => {
    if (!running) return;
    paused = !paused;
    pauseBtn.textContent = paused ? "Resume" : "Pause";
});

playBtn.addEventListener('click', () => {
    startScreen.style.display = "none";
    gameContainer.style.display = "flex";
    resetGame();
    running = true;
    paused = false;
    pauseBtn.textContent = "Pause";
    animationId = requestAnimationFrame(gameLoop);
});

// Aufräumen & Reset
function resetGame() {
    score = 0;
    level = 1;
    lives = 10;
    levelSpan.textContent = level;
    scoreSpan.textContent = score;
    document.getElementById('lives').textContent = lives;
    activeAliens.forEach(a => gameArea.removeChild(a.el));
    activeAliens = [];
}

document.addEventListener('keydown', handleKeydown);
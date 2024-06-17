
"use strict";

const keys = {};
window.addEventListener("keydown", e => {
    keys[e.code] = true;
});
window.addEventListener("keyup", e => {
    keys[e.code] = false;
});

let canvas;
let scoreDisplay;
let g;
let lastFrame = -1;
let deltaTime = 0.0;

let asteroids;
let asteroidCount;
let player;
let score;

const init = () => {
    asteroids = [];
    player = { 
        x: canvas.width / 2, 
        y: canvas.height / 2,
        size: canvas.height / 30,
        health: 1.0
    };
    asteroidCount = 3.0;
    score = 0;
}

const movePlayer = () => {
    let pVelX = 0.0;
    let pVelY = 0.0;
    if(keys["ArrowUp"]) { pVelY -= 1; }
    if(keys["ArrowLeft"]) { pVelX -= 1; }
    if(keys["ArrowDown"]) { pVelY += 1; }
    if(keys["ArrowRight"]) { pVelX += 1; }
    const speed = canvas.height / 3.0 * deltaTime;
    const norm = pVelX != 0 || pVelY != 0? 1 / Math.hypot(pVelX, pVelY) : 1.0;
    player.x += pVelX * norm * speed;
    player.y += pVelY * norm * speed;
}

const killPlayer = () => {
    const p = player;
    for(const a of asteroids) {
        const d = Math.hypot(p.x - a.x, p.y - a.y);
        if(d < p.size + a.size * 0.75) {
            p.health -= 1 / 1.5 * deltaTime;
        }
    }
    if(p.health <= 0.0) {
        init();
    }
}

const moveAsteroids = () => {
    for(const a of asteroids) {
        a.x += a.velX * deltaTime;
        a.y += a.velY * deltaTime;
    }
}

const despawnAsteroids = () => {
    let aIdx = 0;
    while(aIdx < asteroids.length) {
        const a = asteroids[aIdx];
        if(a.age >= a.dieAfter) {
            asteroids.splice(aIdx, 1);
            score += 1;
        } else {
            a.age += deltaTime;
            aIdx += 1;
        }
    }
}

const spawnAsteroids = () => {
    const spawnR = Math.max(canvas.width, canvas.height) * 1.2;
    const targetR = spawnR;
    while(asteroids.length < Math.trunc(asteroidCount)) {
        const posA = Math.random() * 2.0 * Math.PI;
        const posX = Math.sin(posA) * spawnR;
        const posY = Math.cos(posA) * spawnR;
        const tgtA = Math.random() * 2.0 * Math.PI;
        const tgtX = Math.sin(tgtA) * Math.random() * targetR + canvas.width / 2;
        const tgtY = Math.cos(tgtA) * Math.random() * targetR + canvas.height / 2; 
        const velX = tgtX - posX;
        const velY = tgtY - posY;
        const norm = 1 / Math.hypot(velX, velY);
        const size = (canvas.height / 30) + Math.random() * (canvas.height / 10);
        const speed = (canvas.height / 2) - size * 2;
        const dieAfter = spawnR / speed * 2;
        asteroids.push({
            x: posX,
            y: posY,
            velX: velX * norm * speed,
            velY: velY * norm * speed,
            size: size,
            age: 0.0,
            dieAfter: dieAfter
        });
    }
    asteroidCount += (1.0 / 5.0) * deltaTime;
}

const update = () => {
    movePlayer();
    killPlayer();
    moveAsteroids();
    despawnAsteroids();
    spawnAsteroids();
    scoreDisplay.innerText = score;
}

const render = () => {
    for(const a of asteroids) {
        g.save();
        g.translate(a.x, a.y);
        g.rotate(a.age);
        g.strokeStyle = `#000000`;
        g.strokeRect(-a.size / 2, -a.size / 2, a.size, a.size);
        g.restore();
    }
    const p = player;
    g.beginPath();
    g.arc(p.x, p.y, p.size / 2, 0, 2 * Math.PI, false);
    g.lineWidth = 1;
    const pR = (1 - p.health) * 255;
    const pG = (p.health) * 255;
    g.strokeStyle = `rgba(${pR}, ${pG}, 0)`;
    g.stroke();
}

const onFrame = timestamp => {
    if(lastFrame != -1) {
        deltaTime = (timestamp - lastFrame) / 1000; 
    }
    lastFrame = timestamp;
    canvas.width = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;
    update();
    render();
    requestAnimationFrame(onFrame);
}

window.onload = () => {
    canvas = document.getElementById("gamecanvas");
    canvas.width = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;
    scoreDisplay = document.getElementById("gamescore");
    g = canvas.getContext("2d");
    init();
    requestAnimationFrame(onFrame);
}

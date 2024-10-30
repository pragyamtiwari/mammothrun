let buildings = [
    { src: 'building1.png', width: 85, height: 68 },
    { src: 'building2.png', width: 94, height: 94 },
    { src: 'building3.png', width: 105, height: 77 },
    { src: 'building4.png', width: 34, height: 126 },
    { src: 'building5.png', width: 112, height: 94 },
    { src: 'building6.png', width: 94, height: 85 },
    { src: 'building7.png', width: 100, height: 101 },
    { src: 'building8.png', width: 201, height: 102 },
    { src: 'building9.png', width: 133, height: 111 },
    { src: 'building10.png', width: 128, height: 128 },
    { src: 'building11.png', width: 95, height: 95 }
];





const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');


const container = document.querySelector('.game-container');
canvas.width = container.offsetWidth;
canvas.height = container.offsetHeight;


// Game Variables
let isJumping = false;
let jumpHeight = 0;
let gravity = 10; // Reduced gravity for slower fall
let maxJumpHeight = 65; // Increased jump height for better clearance
let score = 0;
let gameSpeed = 12; 
let gameOver = false;
let gameAlertShown = false;

const elevatedGroundLevel = 160;
const buildingspeciallevel = 30; 
let jumpCount = 0; 
let spawnInterval = 3000;
; 
let lastSpawnTime = Date.now(); 

// Load Jump Sound
const jumpSound = new Audio('jump.mp3'); // Ensure you have a jump.mp3 file
const dieSound = new Audio('die.mp3');

// Mammoth Object
const mammoth = {
    x: 50,
    y: canvas.height - elevatedGroundLevel, 
    width: 120, 
    height: 120, 
    isInAir: false,
    isDead: false, 
    jump: function() {
        if (!gameOver && jumpCount < 2) {
            isJumping = true;
            this.isInAir = true;
            jumpHeight = maxJumpHeight;
            jumpCount++;

            // Play jump sound
            jumpSound.currentTime = 0; 
            jumpSound.play();
        }
    },
    draw: function() {
        const img = new Image();
        
        // Change image to 'dead.png' when game is over
        if (!this.isDead){
            img.src = 'mammoth.png';
        } else{
            img.src = 'dead.png';
        }
        

        // Draw the mammoth image
        ctx.drawImage(img, this.x, this.y, this.width, this.height);
    }
};

// Background Object
const background = {
    x: 0,
    draw: function() {
        const img = new Image();
        img.src = 'background.png';
        ctx.drawImage(img, this.x, 0, canvas.width, canvas.height);
    }
};

// Building Class
class Building {
    constructor() {
        const building = buildings[Math.floor(Math.random() * buildings.length)];

        this.width = building.width; // Increased width
        this.height = building.height; // Increased height
        this.x = canvas.width;
        this.y = canvas.height - buildingspeciallevel - this.height;
        this.image = new Image();
        this.image.src = building.src;
    }

    update() {
        this.x -= gameSpeed;
    }

    draw() {
        ctx.drawImage(this.image, this.x, this.y, this.width, this.height);
    }

    // Adjusted hitbox for lenient collision detection
    isColliding(mammoth) {
        let buffer = 30; 
        return (
            mammoth.x < this.x + this.width - buffer &&
            mammoth.x + mammoth.width > this.x + buffer &&
            mammoth.y < this.y + this.height - buffer &&
            mammoth.y + mammoth.height > this.y + buffer
        );
    }
}

// Game Objects
let obstacles = [];

function spawnBuilding() {
    const currentTime = Date.now();
    if (currentTime - lastSpawnTime > spawnInterval) {
        spawnInterval = 500 + Math.floor(Math.random() * 2000); // Base interval of 500ms
        obstacles.push(new Building());
        lastSpawnTime = currentTime;
    }
}


// Game Loop
// Update Game Loop for collision
function gameLoop() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw background
    background.draw();

    // Draw mammoth
    mammoth.draw();

    // Update and draw buildings
    for (let i = obstacles.length - 1; i >= 0; i--) {
        const obstacle = obstacles[i];
        obstacle.update();
        obstacle.draw();

        // Collision detection
        if (obstacle.isColliding(mammoth) && !gameOver) {
            gameOver = true;
            mammoth.isDead = true; // Set mammoth to dead
            dieSound.currentTime = 0; 
            dieSound.play();
            

            // Re-render dead mammoth before showing alert
            mammoth.draw();

            // Delay alert to allow rendering the dead mammoth
            setTimeout(() => {
                alert('Game Over! Final Score: ' + score);
                resetGame();
            }, 100); // 200ms delay to allow image rendering
            return;
        }

        // Remove off-screen obstacles
        if (obstacle.x + obstacle.width < 0) {
            obstacles.splice(i, 1);
            score++;
            document.getElementById('score').textContent = score;
        }
    }

    // Handle building spawning
    spawnBuilding();

    // Jump logic
    if (isJumping) {
        mammoth.y -= jumpHeight;
        jumpHeight -= gravity;
        if (jumpHeight <= 0) {
            isJumping = false;
        }
    } else {
        // Apply gravity to mammoth
        if (mammoth.y < canvas.height - elevatedGroundLevel) {
            mammoth.y += gravity; 
        } else {
            mammoth.isInAir = false;
            jumpCount = 0;
        }
    }

    // Continue the game loop if not over
    if (!gameOver) {
        requestAnimationFrame(gameLoop);
    }
}


// Control Events
window.addEventListener('keydown', (e) => {
    if (e.code === 'Space') mammoth.jump();
});

canvas.addEventListener('click', () => {
    mammoth.jump();
});

function startGame() {
    lastSpawnTime = Date.now(); 
    obstacles = [];
    score = 0;
    gameOver = false;
    jumpCount = 0;
    mammoth.y = canvas.height - elevatedGroundLevel;
    mammoth.isInAir = false;
    mammoth.isDead = false; // Reset mammoth to alive
    gameLoop();
}

function resetGame() {
    score = 0;
    document.getElementById('score').textContent = score;
    startGame();
}

// Initialize Game
startGame();


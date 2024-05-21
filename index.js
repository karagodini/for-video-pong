const canvas = document.getElementById("game");
const context = canvas.getContext("2d");
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

const paddleWidth = 18,
    paddleHeight = 120,
    paddleSpeed = 8,
    ballRadius = 12,
    initialBallSpeed = 8,
    maxBallSpeed = 40,
    netWidth = 5,
    netColor = "WHITE";

// Рисуем сетку на холсте
function drawNet() {
    for (let i = 0; i <= canvas.height; i += 15) {
        drawRect(canvas.width / 2 - netWidth / 2, i, netWidth, 10, netColor);
    }
}

// Нарисуем прямоугольник на холсте
function drawRect(x, y, width, height, color) {
    context.fillStyle = color;
    context.fillRect(x, y, width, height);
}

// Нарисуем круг на холсте
function drawCircle(x, y, radius, color) {
    context.fillStyle = color;
    context.beginPath();
    context.arc(x, y, radius, 0, Math.PI * 2, false);
    context.closePath();
    context.fill();
}

// Нарисуйте текст на холсте
function drawText(text, x, y, color, fontSize = 60, fontWeight = 'bold', font = "Courier New") {
    context.fillStyle = color;
    context.font = `${fontWeight} ${fontSize}px ${font}`;
    context.textAlign = "center";
    context.fillText(text, x, y);
}

// Создадим весло
function createPaddle(x, y, width, height, color) {
    return { x, y, width, height, color, score: 0 };
}

// Создадим шар
function createBall(x, y, radius, velocityX, velocityY, color) {
    return { x, y, radius, velocityX, velocityY, color, speed: initialBallSpeed };
}

// Определим объекты весла для пользователя и компьютера
const user = createPaddle(0, canvas.height / 2 - paddleHeight / 2, paddleWidth, paddleHeight, "WHITE");

const com = createPaddle(canvas.width - paddleWidth, canvas.height / 2 - paddleHeight / 2, paddleWidth, paddleHeight, "WHITE");

// Определим шар
const ball = createBall(canvas.width / 2, canvas.height / 2, ballRadius, initialBallSpeed, initialBallSpeed, "WHITE");

// Обновим положение манипулятора пользователя в зависимости от движения мыши
canvas.addEventListener('mousemove', movePaddle);

function movePaddle(event) {
    const rect = canvas.getBoundingClientRect();
    user.y = event.clientY - rect.top - user.height / 2;
}

// Проверим, нет ли столкновения между мячом и лопаткой
function collision(b, p) {
    return (
        b.x + b.radius > p.x && b.x - b.radius < p.x + p.width && b.y + b.radius > p.y && b.y - b.radius < p.y + p.height
    );
}

// Сбросим положение и скорость мяча
function resetBall() {
    ball.x = canvas.width / 2;
    ball.y = Math.random() * (canvas.height - ball.radius * 2) + ball.radius;
    ball.velocityX = -ball.velocityX;
    ball.speed = initialBallSpeed;
}

// Обновим логику игры
function update() {
    // Проверим результат и при необходимости сбросим мяч
    if (ball.x - ball.radius < 0) {
        com.score++;
        resetBall();
    } else if (ball.x + ball.radius > canvas.width) {
        user.score++;
        resetBall();
    }

    // Обновим положение мяча
    ball.x += ball.velocityX;
    ball.y += ball.velocityY;

    // Обновим положение весла компьютера в зависимости от положения мяча
    com.y += (ball.y - (com.y + com.height / 2)) * 0.1;

    // Верхняя и нижняя стенка
    if (ball.y - ball.radius < 0 || ball.y + ball.radius > canvas.height) {
        ball.velocityY = -ball.velocityY;
    }

    // Определим, по какому веслу ударяет мяч, и справимся со столкновением
    let player = ball.x + ball.radius < canvas.width / 2 ? user : com;
    if (collision(ball, player)) {
        const collidePoint = ball.y - (player.y + player.height / 2);
        const collisionAngle = (Math.PI / 4) * (collidePoint / (player.height / 2));
        const direction = ball.x + ball.radius < canvas.width / 2 ? 1 : -1;
        ball.velocityX = direction * ball.speed * Math.cos(collisionAngle);
        ball.velocityY = ball.speed * Math.sin(collisionAngle);

        // Увеличим скорость мяча и ограничим ее до максимальной
        ball.speed += 0.2;
        if (ball.speed > maxBallSpeed) {
            ball.speed = maxBallSpeed;
        }
    }
}

// Рендеринг игры на холсте
function render() {
    // Прозрачный холст с черным экраном
    drawRect(0, 0, canvas.width, canvas.height, "BLACK");
    drawNet();

    // Результаты
    drawText(user.score, canvas.width / 4, canvas.height / 2, "GRAY", 120, 'bold');
    drawText(com.score, (3 * canvas.width) / 4, canvas.height / 2, "GRAY", 120, 'bold');

    // Нарисуем весло
    drawRect(user.x, user.y, user.width, user.height, user.color);
    drawRect(com.x, com.y, com.width, com.height, com.color);

    // Нарисуем мяч
    drawCircle(ball.x, ball.y, ball.radius, ball.color);

}


// Запуск игры
function gameLoop() {
    update();
    render();
}

// Игровой цикл 60 кадров в секунду
const framePerSec = 60;
setInterval(gameLoop, 1000 / framePerSec);
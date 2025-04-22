let carPosX;
let carScale;
let isMovingRight = false;
let isBraking = false;
let isPaused = false;

function setup() {
  createCanvas(windowWidth, windowHeight);
  background(255);
  carScale = width / 900 * 0.4;
  carPosX = width / 2 - 100 * carScale;
  loop();
}

function draw() {
  drawEnvironment();
  carScale = width / 900 * 0.4;
  // 按鍵組合邏輯
  if (isMovingRight && isBraking) {
    carPosX += 5 * carScale; // D+空白鍵：慢速（加快）
  } else if (isMovingRight) {
    carPosX += 12 * carScale; // 只有D：快速（更快）
  } // 只按空白鍵或都沒按：不動
  let carY = height / 2;
  drawSportsCar(carPosX, carY, carScale);
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}

function keyPressed() {
  // D 鍵按下開始移動
  if (key === 'd' || key === 'D') {
    isMovingRight = true;
  }
  // ~ 鍵（keyCode 192，或 key === "~"）移到最左邊
  if (key === '~' || keyCode === 192) {
    carPosX = 0;
  }
  // 空白鍵煞車（慢速前進）
  if (key === ' ' || keyCode === 32) {
    isBraking = true;
  }
  // ESC 鍵按下暫停或繼續
  if (keyCode === 27) {
    if (!isPaused) {
      noLoop();
      isPaused = true;
      // 顯示暫停畫面
      push();
      fill(0, 0, 0, 150);
      rect(0, 0, width, height);
      fill(255);
      textSize(64);
      textAlign(CENTER, CENTER);
      text('暫停', width / 2, height / 2);
      pop();
    } else {
      loop();
      isPaused = false;
    }
    return;
  }
}

function keyReleased() {
  // D 鍵放開停止移動
  if (key === 'd' || key === 'D') {
    isMovingRight = false;
  }
  // 空白鍵放開停止慢速前進
  if (key === ' ' || keyCode === 32) {
    isBraking = false;
  }
}

function drawSportsCar(x, y, s) {
  push();
  translate(x, y);
  scale(s);

  // 陰影
  noStroke();
  fill(80, 100, 120, 60);
  ellipse(220, 90, 350, 40);

  // 車身下半部
  fill(220, 30, 40);
  beginShape();
  vertex(40, 100);
  bezierVertex(70, 80, 120, 60, 360, 70);
  bezierVertex(420, 80, 480, 130, 470, 150);
  vertex(470, 150);
  vertex(440, 160);
  vertex(70, 160);
  vertex(40, 140);
  endShape(CLOSE);

  // 車身上半部
  fill(230, 40, 50);
  beginShape();
  vertex(80, 100);
  bezierVertex(120, 60, 170, 45, 320, 55);
  bezierVertex(400, 60, 430, 110, 430, 110);
  vertex(430, 130);
  bezierVertex(390, 100, 120, 100, 80, 120);
  endShape(CLOSE);

  // 車窗
  fill(100, 180, 240, 210);
  beginShape();
  vertex(150, 92);
  bezierVertex(200, 70, 320, 68, 380, 90);
  vertex(390, 120);
  bezierVertex(320, 105, 220, 105, 160, 120);
  endShape(CLOSE);

  // 車燈
  fill(255, 240, 120);
  ellipse(65, 125, 18, 10);
  fill(255, 200, 80);
  ellipse(445, 135, 15, 7);

  // 輪胎
  fill(30);
  ellipse(130, 160, 60, 60);
  ellipse(370, 160, 60, 60);
  fill(180);
  ellipse(130, 160, 28, 28);
  ellipse(370, 160, 28, 28);

  // 車門線
  stroke(150, 0, 0, 120);
  strokeWeight(3);
  line(260, 110, 260, 150);
  noStroke();

  pop();
}

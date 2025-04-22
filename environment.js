// environment.js
// 你可以在這裡定義賽車遊戲的賽道、背景、障礙物等環境相關的繪圖或邏輯

// 全域：貓狗列表
let catDogList = [];
let lastCatDogSeed = -1;
// horizontal offset for background scrolling
let envOffsetX = 0;
let envOffsetBg = 0;

function drawEnvironment() {
  randomSeed(refreshSeed);
  // calculate road geometry
  let roadH = height * 0.5;
  let roadY = height / 2 - roadH / 2;
  // update scrolling offsets
  let speed = (isMovingRight ? (isBraking ? 5 : 12) * carScale : 0);
  envOffsetX += speed;
  envOffsetBg += speed * 0.5;
  // background layer (grass, pattern, dots, trees, buildings)
  let bgOffset = envOffsetBg % width;
  for (let k = 0; k < 2; k++) {
    // reset random for identical tiling across splits
    randomSeed(refreshSeed);
    push();
    translate(-bgOffset + k * width, 0);
    // grass
    noStroke();
    fill(random(40,80), random(140,200), random(60,120));
    rect(0, 0, width, height);
    // pattern
    for (let i = 0; i < width; i += 60) {
      for (let j = 0; j < height; j += 60) {
        fill(random(70,120), random(180,230), random(80,140), 40);
        rect(i, j, 40, 40);
      }
    }
    for (let i = 0; i < 18; i++) {
      fill(random(90,180), random(170,230), random(90,170), 60);
      ellipse(random(width), random(height), random(16,38));
    }
    // trees & buildings
    for (let i = 0; i < 4; i++) {
      let x = map(i, 0, 3, 60, width - 60);
      drawTree(x, roadY * 0.4);
      drawTree(x, roadY + roadH + (height - (roadY + roadH)) * 0.6);
    }
    for (let i = 0; i < 4; i++) {
      let x = random(80, width - 80);
      let y1 = random(roadY * 0.05, roadY * 0.7);
      drawRandomBuilding(x, y1);
      let y2 = random(roadY + roadH + 30, height - 30);
      drawRandomBuilding(x + 30, y2);
    }
    pop();
  }
  // foreground layer (road, dashes, cats/dogs)
  let fgOffset = envOffsetX % width;
  for (let k = 0; k < 2; k++) {
    // reset random if needed for cats/dogs appearance
    randomSeed(refreshSeed);
    push();
    translate(-fgOffset + k * width, 0);
    // road
    noStroke();
    fill(60, 60, 60);
    rect(0, roadY, width, roadH);
    // dashes
    stroke(255);
    strokeWeight(8);
    let dashLen2 = 40, gap2 = 30;
    for (let x2 = 0; x2 < width; x2 += dashLen2 + gap2) {
      line(x2, height/2, x2 + dashLen2, height/2);
    }
    noStroke();
    // cats & dogs
    for (let i = 0; i < catDogList.length; i++) {
      let c = catDogList[i];
      c.x += c.dx;
      if (c.x < 40) { c.x = 40; c.dx *= -1; }
      if (c.x > width - 40) { c.x = width - 40; c.dx *= -1; }
      let tailAngle = 0.7 * sin(frameCount * 0.1 + c.tailSeed + c.tailPhase);
      if (c.isCat) drawCat(c.x, c.y, tailAngle);
      else drawDog(c.x, c.y, tailAngle);
    }
    pop();
  }
  // --- 每次刷新時產生新的貓狗 ---
  if (refreshSeed !== lastCatDogSeed) {
    catDogList = [];
    for (let i = 0; i < 4; i++) {
      let isCat = random() < 0.5;
      let x = random(60, width - 60);
      let y = i < 2 ? random(roadY * 0.1, roadY * 0.8) : random(roadY + roadH + 20, height - 40);
      let dx = random([-1, 1]) * random(0.5, 1.2);
      catDogList.push({
        isCat, x, y, dx, tailSeed: random(1000), tailPhase: random(TWO_PI)
      });
    }
    lastCatDogSeed = refreshSeed;
  }
}

// 樹
function drawTree(x, y) {
  // 樹幹
  fill(120, 80, 40);
  rect(x - 5, y + 20, 10, 28, 4);
  // 樹冠
  fill(random(24,60), random(120,180), random(34,80));
  ellipse(x, y + 15, 38, 38);
  ellipse(x - 13, y + 22, 24, 24);
  ellipse(x + 13, y + 22, 24, 24);
}

// 貓
function drawCat(x, y, tailAngle) {
  push();
  translate(x, y);
  scale(0.7);
  // 身體
  fill(180,180,200);
  ellipse(0, 18, 32, 18);
  // 頭
  fill(200,200,220);
  ellipse(0, 0, 22, 22);
  // 耳朵
  triangle(-7, -8, -2, -18, 0, -7);
  triangle(7, -8, 2, -18, 0, -7);
  // 臉
  fill(80);
  ellipse(-4, 0, 3, 3);
  ellipse(4, 0, 3, 3);
  stroke(80);
  line(-2, 4, 0, 6);
  line(2, 4, 0, 6);
  // 尾巴
  noFill();
  stroke(120,120,150);
  strokeWeight(2);
  push();
  translate(14, 18);
  rotate(tailAngle || 0);
  arc(0, 0, 14, 10, HALF_PI, PI+HALF_PI);
  pop();
  noStroke();
  pop();
}

// 狗
function drawDog(x, y, tailAngle) {
  push();
  translate(x, y);
  scale(0.7);
  // 身體
  fill(200,180,130);
  ellipse(0, 18, 34, 18);
  // 頭
  fill(220,200,140);
  ellipse(0, 0, 22, 22);
  // 耳朵
  fill(120,90,60);
  ellipse(-7, -6, 7, 14);
  ellipse(7, -6, 7, 14);
  // 臉
  fill(80);
  ellipse(-4, 0, 3, 3);
  ellipse(4, 0, 3, 3);
  stroke(80);
  line(-2, 5, 0, 8);
  line(2, 5, 0, 8);
  // 尾巴
  noFill();
  stroke(120,100,60);
  strokeWeight(2);
  push();
  translate(15, 20);
  rotate(tailAngle || 0);
  arc(0, 0, 13, 10, HALF_PI, PI+HALF_PI);
  pop();
  noStroke();
  pop();
}

// 多種隨機建築物
function drawRandomBuilding(x, y) {
  let t = int(random(3));
  if (t === 0) {
    // 高樓
    fill(170, 190, 230);
    rect(x-17, y+10, 34, 60, 7);
    fill(120,150,200);
    rect(x-10, y+16, 8, 14, 2);
    rect(x+2, y+16, 8, 14, 2);
    fill(120,100,60);
    rect(x-5, y+55, 10, 15, 2);
  } else if (t === 1) {
    // 紅屋頂小屋
    fill(240, 210, 120);
    rect(x-22, y+18, 44, 34, 4);
    fill(180, 60, 60);
    triangle(x-26, y+18, x+26, y+18, x, y);
    fill(120, 80, 40);
    rect(x-6, y+36, 12, 16, 2);
  } else {
    // 現代玻璃屋
    fill(120, 220, 220);
    rect(x-18, y+22, 36, 32, 6);
    fill(80, 170, 200);
    rect(x-10, y+32, 20, 12, 3);
    fill(200, 200, 220);
    ellipse(x, y+22, 36, 14);
  }
}

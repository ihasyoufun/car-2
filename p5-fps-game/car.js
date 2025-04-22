let carPosX;
let carPosY;
let carScale;
let isMovingRight = false;
let isMovingUp = false;
let isMovingDown = false;
let isBraking = false;
let isBoosting = false; // Shift 加速
let isPaused = false;

// 到最右邊的刷新次數
let refreshCount = 0;
let deathCount = 0;

// --- 每次刷新時都會變的種子 ---
let refreshSeed = Math.floor(Math.random()*10000);

// --- 敵車資料 ---
let otherCars = []; // {x, y}
let enemySpawnTimer = 0;

// 全域：新增開始狀態與開始按鈕設定
let isStarted = false;
let startBtn = { x: 0, y: 0, w: 200, h: 50 };
let language = 'zh'; // 'zh' or 'en'
let langBtn = { x: 0, y: 0, w: 200, h: 50 };
let difficulty = ''; // 'easy','normal','hard'
let maxDeaths = Infinity;
let isGameOver = false;
let showDiffMenu = false;
let diffBtn = { x: 0, y: 0, w: 200, h: 50 };
let easyBtn = { x: 0, y: 0, w: 150, h: 40 };
let normalBtn = { x: 0, y: 0, w: 150, h: 40 };
let hardBtn = { x: 0, y: 0, w: 150, h: 40 };
let timerDuration = 300000; // 倒數5分鐘(毫秒)
let startTime = 0;
let isTimeUp = false;

// 暫停選單按鈕
let resumeBtn = { x: 0, y: 0, w: 200, h: 60 };
let lobbyBtn = { x: 0, y: 0, w: 200, h: 60 };

// 全域：偵測手機與觸控按鈕
let isMobile = false;
let upBtn = { x: 0, y: 0, w: 60, h: 60 };
let downBtn = { x: 0, y: 0, w: 60, h: 60 };
let rightBtn = { x: 0, y: 0, w: 60, h: 60 };
let brakeBtn = { x: 0, y: 0, w: 60, h: 60 };
let pauseBtn = { x: 0, y: 0, w: 60, h: 60 };

function setup() {
  createCanvas(windowWidth, windowHeight);
  background(255);
  carScale = width / 900 * 0.18; // 車輛縮小
  carPosX = 215 * carScale; // 車頭貼齊畫面左邊
  // 賽道中央
  carPosY = height / 2;
  // 計算按鈕位置
  let midX = width/2;
  startBtn.x = midX - startBtn.w/2;
  startBtn.y = height/2 - startBtn.h/2;
  langBtn.x = midX - langBtn.w/2;
  langBtn.y = startBtn.y + startBtn.h + 20;
  diffBtn.x = midX - diffBtn.w/2;
  diffBtn.y = langBtn.y + langBtn.h + 20;
  // difficulty buttons inside menu
  easyBtn.x = midX - easyBtn.w/2;
  normalBtn.x = easyBtn.x;
  hardBtn.x = easyBtn.x;
  easyBtn.y = diffBtn.y + diffBtn.h + 10;
  normalBtn.y = easyBtn.y + easyBtn.h + 10;
  hardBtn.y = normalBtn.y + normalBtn.h + 10;
  // 計算暫停選單按鈕位置
  resumeBtn.x = width/2 - resumeBtn.w/2;
  resumeBtn.y = height/3 - resumeBtn.h/2;
  lobbyBtn.x = width/2 - lobbyBtn.w/2;
  lobbyBtn.y = resumeBtn.y + resumeBtn.h + 20;

  isMobile = /Mobi|Android/i.test(navigator.userAgent);
  if (isMobile) {
    let m = 20, bw = 60, bh = 60;
    upBtn = { x: m, y: height - 3*(bh + m), w: bw, h: bh };
    downBtn = { x: m, y: height - 2*(bh + m), w: bw, h: bh };
    rightBtn = { x: m, y: height - (bh + m), w: bw, h: bh };
    brakeBtn = { x: width - bw - m, y: height - (bh + m), w: bw, h: bh };
    pauseBtn = { x: width - bw - m, y: height - 2*(bh + m), w: bw, h: bh };
  }
  loop();
}

function draw() {
  if (!isStarted) {
    drawEnvironment(); fill(0,0,0,150); rect(0,0,width,height);
    noStroke(); textAlign(CENTER,CENTER);
    // 大廳標題
    fill(255); textSize(48);
    text(language==='en'?'Endless Traffic Dodge':'無盡躲避球車流', width/2, height*0.15);
    // START 按鈕
    fill(100,200,100); rect(startBtn.x,startBtn.y,startBtn.w,startBtn.h,10);
    fill(255); textSize(32); text(language==='en'?'START':'開始',width/2,startBtn.y+startBtn.h/2);
    // 語言按鈕
    fill(200,200,100); rect(langBtn.x,langBtn.y,langBtn.w,langBtn.h,8);
    fill(0); textSize(20); text(language==='en'?'EN':'中文',width/2,langBtn.y+langBtn.h/2);
    // 難度選單按鈕
    fill(100,100,200);
    rect(diffBtn.x,diffBtn.y,diffBtn.w,diffBtn.h,8);
    // 顯示當前難度或預設
    fill(255);
    textSize(20);
    let diffLabel = difficulty === ''
      ? (language==='en'?'Difficulty':'難度')
      : difficulty==='easy'   ? (language==='en'?'Easy':'簡單')
      : difficulty==='normal' ? (language==='en'?'Normal':'普通')
      : (language==='en'?'Hard':'困難');
    text(diffLabel, width/2, diffBtn.y+diffBtn.h/2);
    // 顯示難度菜單內按鈕
    if (showDiffMenu) {
      // 容器
      fill(200,200,200,230); rect(diffBtn.x,easyBtn.y-10,diffBtn.w,(hardBtn.y+hardBtn.h)-(easyBtn.y-10),8);
      // 三個難度
      ['easy','normal','hard'].forEach((d,i)=>{
        let btn = [easyBtn,normalBtn,hardBtn][i];
        fill(180); rect(btn.x,btn.y,btn.w,btn.h,5);
        fill(0); textSize(18);
        let label = d==='easy'? (language==='en'?'Easy':'簡單') : d==='normal'? (language==='en'?'Normal':'普通') : (language==='en'?'Hard':'困難');
        text(label, width/2, btn.y+btn.h/2);
      });
      // 遊戲介紹與操作說明
      fill(255);
      textSize(14);
      textAlign(LEFT, TOP);
      let infoY = diffBtn.y + diffBtn.h + 20;
      if (language === 'en') {
        text('Game: Endless Traffic Dodge', width*0.1, infoY);
        text('Use Up/Down arrows or touch buttons to move, Right arrow to advance.', width*0.1, infoY+20);
        text('Press Space to brake, Shift to boost.', width*0.1, infoY+40);
        text('Select difficulty from menu above.', width*0.1, infoY+60);
      } else {
        text('遊戲介紹：無盡躲避車流', width*0.1, infoY);
        text('使用上下鍵或觸控按鈕移動，向右前進。', width*0.1, infoY+20);
        text('按空白鍵煞車，Shift 加速。', width*0.1, infoY+40);
        text('可在上方難度菜單選擇關卡難易度。', width*0.1, infoY+60);
      }
    }
    return;
  }
  // 計時檢查
  if (!isTimeUp && millis() - startTime >= timerDuration) {
    isTimeUp = true;
  }
  // 判斷死亡次數達到上限
  if (!isGameOver && deathCount > maxDeaths) {
    isGameOver = true;
  }
  // 遊戲結束畫面
  if (isTimeUp || isGameOver) {
    background(0);
    fill(255);
    textSize(64);
    textAlign(CENTER, CENTER);
    text(isGameOver ? (language === 'en' ? 'Game Over' : '遊戲結束') : "Time's Up", width/2, height/3);
    textSize(32);
    if (language === 'en') {
      text('Refresh: ' + refreshCount, width/2, height/2);
      text('Deaths: ' + deathCount, width/2, height*2/3);
    } else {
      text('刷新次數：' + refreshCount, width/2, height/2);
      text('死亡次數：' + deathCount, width/2, height*2/3);
    }
    // 返回大廳按鈕
    fill(100,200,100);
    rect(lobbyBtn.x, lobbyBtn.y, lobbyBtn.w, lobbyBtn.h, 8);
    fill(255);
    textSize(24);
    textAlign(CENTER, CENTER);
    text(language==='en' ? 'Lobby' : '返回大廳', width/2, lobbyBtn.y + lobbyBtn.h/2);
    // 遊戲結束後重置計數
    deathCount = 0;
    refreshCount = 0;
    noLoop();
    return;
  }
  drawEnvironment(); // 先畫賽道
  background(0,0,0,0); // 保持透明度，避免覆蓋賽道
  // 顯示倒數計時
  let elapsed = millis() - startTime;
  let rem = max(0, timerDuration - elapsed);
  let mins = floor(rem / 60000);
  let secs = floor((rem % 60000) / 1000);
  let secStr = secs < 10 ? '0' + secs : secs;
  fill(255);
  noStroke();
  textSize(28);
  textAlign(LEFT, TOP);
  if (language === 'en') {
    text('Time Left: ' + mins + ':' + secStr, 20, 16);
  } else {
    text('倒數：' + mins + ':' + secStr, 20, 16);
  }
  carScale = width / 900 * 0.18; // 車輛縮小
  // carPosX 為水平位置
  if (isMovingRight && isBraking) {
    carPosX += 5 * carScale; // D+空白鍵：慢速
  } else if (isMovingRight && isBoosting) {
    carPosX += 22 * carScale; // D+Shift：超快
  } else if (isMovingRight) {
    carPosX += 12 * carScale; // 只有D：快速
  }
  // W/S 控制 carPosY，限制範圍在賽道區域
  let roadH = height * 0.5;
  let roadY = height/2 - roadH/2;
  let carTop = roadY + 30 * carScale;
  let carBottom = roadY + roadH - 30 * carScale;
  if (isMovingUp) {
    carPosY -= 8 * carScale;
  }
  if (isMovingDown) {
    carPosY += 8 * carScale;
  }
  // 限制車子不能超過賽道
  carPosY = constrain(carPosY, carTop, carBottom);

  // --- 敵車生成 ---
  enemySpawnTimer--;
  if (enemySpawnTimer <= 0) {
    // 產生不重複的 y 位置
    let maxTry = 10;
    let enemyY;
    for (let t = 0; t < maxTry; t++) {
      let tryY = random(carTop, carBottom);
      let tooClose = false;
      for (let j = 0; j < otherCars.length; j++) {
        if (abs(otherCars[j].y - tryY) < 80 * carScale) {
          tooClose = true;
          break;
        }
      }
      if (!tooClose) { enemyY = tryY; break; }
      if (t === maxTry-1) enemyY = tryY; // 最後一次強制接受
    }
    let enemyX = random(width, width + 200) + 260 * carScale;
    otherCars.push({x: enemyX, y: enemyY}); // 在右側隨機位置生成
    // --- 生成間隔隨刷新次數變短 ---
    let minInterval = max(10, 25 - refreshCount * 2);
    let maxInterval = max(18, 55 - refreshCount * 3);
    enemySpawnTimer = int(random(minInterval, maxInterval));
    // --- 機率多生一台敵車 ---
    let extraCarChance = min(0.5, 0.12 + refreshCount * 0.05); // 最多50%
    if (random() < extraCarChance) {
      // 再生一台
      let enemyY2;
      for (let t = 0; t < maxTry; t++) {
        let tryY = random(carTop, carBottom);
        let tooClose = false;
        for (let j = 0; j < otherCars.length; j++) {
          if (abs(otherCars[j].y - tryY) < 80 * carScale) {
            tooClose = true;
            break;
          }
        }
        if (!tooClose) { enemyY2 = tryY; break; }
        if (t === maxTry-1) enemyY2 = tryY;
      }
      let enemyX2 = random(width, width + 200) + 260 * carScale;
      otherCars.push({x: enemyX2, y: enemyY2});
    }
  }
  // --- 敵車移動與繪製 ---
  // --- 敵車速度隨刷新次數變快 ---
  let baseEnemySpeed = 16 + refreshCount * 2; // 每刷新+2
  for (let i = otherCars.length - 1; i >= 0; i--) {
    otherCars[i].x -= baseEnemySpeed * carScale;
    drawSportsCar(otherCars[i].x, otherCars[i].y, carScale, true); // true:敵車
    if (otherCars[i].x < -260 * carScale) {
      otherCars.splice(i, 1); // 移除超出左邊的車
    }
  }

  // --- 玩家車 ---
  drawSportsCar(carPosX, carPosY, carScale, false);

  // --- 右上角顯示刷新次數 ---
  fill(0,180);
  noStroke();
  textSize(28);
  textAlign(RIGHT, TOP);
  // 本局統計
  if (language === 'en') {
    text('Refresh: ' + refreshCount, width-20, 16);
    text('Deaths: ' + deathCount, width-20, 48);
  } else {
    text('刷新次數：' + refreshCount, width-20, 16);
    text('死亡次數：' + deathCount, width-20, 48);
  }

  // --- 過關刷新判斷 ---
  if (carPosX + 215 * carScale >= width) {
    carPosX = 215 * carScale; // 回到最左邊
    otherCars = [];
    refreshSeed = Math.floor(Math.random()*10000);
    refreshCount++;
    // 可加其他重置狀態
  }

  // --- 碰撞判斷 ---
  // 玩家車的碰撞框
  let playerBox = {
    left: carPosX - 215 * carScale,
    right: carPosX + 215 * carScale,
    top: carPosY - 50 * carScale,
    bottom: carPosY + 50 * carScale
  };
  for (let i = 0; i < otherCars.length; i++) {
    let enemy = otherCars[i];
    let enemyBox = {
      left: enemy.x - 215 * carScale,
      right: enemy.x + 215 * carScale,
      top: enemy.y - 50 * carScale,
      bottom: enemy.y + 50 * carScale
    };
    let overlap = !(playerBox.right < enemyBox.left || playerBox.left > enemyBox.right || playerBox.bottom < enemyBox.top || playerBox.top > enemyBox.bottom);
    if (overlap) {
      deathCount++; // 碰撞計次
      carPosX = 215 * carScale; // 撞到就回最左邊
      otherCars = []; // 敵車全部重置
      refreshSeed = Math.floor(Math.random()*10000);
      break;
    }
  }

  // 暫停選單
  if (isPaused) {
    // 半透明遮罩
    fill(0, 0, 0, 150);
    rect(0, 0, width, height);
    noStroke();
    // 繼續按鈕
    fill(100, 200, 100);
    rect(resumeBtn.x, resumeBtn.y, resumeBtn.w, resumeBtn.h, 10);
    fill(255);
    textAlign(CENTER, CENTER);
    textSize(32);
    text(language === 'en' ? 'Resume' : '繼續', width/2, resumeBtn.y + resumeBtn.h/2);
    // 返回大廳按鈕
    fill(200, 100, 100);
    rect(lobbyBtn.x, lobbyBtn.y, lobbyBtn.w, lobbyBtn.h, 10);
    fill(255);
    text(language === 'en' ? 'Lobby' : '大廳', width/2, lobbyBtn.y + lobbyBtn.h/2);
    return;
  }

  // 手機版遊戲中顯示觸控按鈕
  if (isMobile && isStarted && !isPaused) {
    noStroke(); textAlign(CENTER, CENTER);
    // 左側移動
    fill(150,150,150,200);
    rect(upBtn.x, upBtn.y, upBtn.w, upBtn.h, 8);
    fill(0); textSize(32); text('↑', upBtn.x + upBtn.w/2, upBtn.y + upBtn.h/2);
    fill(150,150,150,200);
    rect(downBtn.x, downBtn.y, downBtn.w, downBtn.h, 8);
    fill(0); text('↓', downBtn.x + downBtn.w/2, downBtn.y + downBtn.h/2);
    fill(150,150,150,200);
    rect(rightBtn.x, rightBtn.y, rightBtn.w, rightBtn.h, 8);
    fill(0); text('→', rightBtn.x + rightBtn.w/2, rightBtn.y + rightBtn.h/2);
    // 右側煞車與暫停
    fill(150,150,150,200);
    rect(brakeBtn.x, brakeBtn.y, brakeBtn.w, brakeBtn.h, 8);
    fill(0); textSize(16); text(language==='en'?'Slow':'慢速', brakeBtn.x + brakeBtn.w/2, brakeBtn.y + brakeBtn.h/2);
    fill(150,150,150,200);
    rect(pauseBtn.x, pauseBtn.y, pauseBtn.w, pauseBtn.h, 8);
    fill(0); textSize(24); text('II', pauseBtn.x + pauseBtn.w/2, pauseBtn.y + pauseBtn.h/2);
  }
}

function keyPressed() {
  // ESC 鍵：切換暫停狀態
  if (keyCode === 27) {
    if (isStarted && !isTimeUp) {
      isPaused = !isPaused;
    }
    return;
  }
  // D 鍵按下開始移動（往右）
  if (key === 'd' || key === 'D') {
    isMovingRight = true;
  }
  // W 鍵往上
  if (key === 'w' || key === 'W') {
    isMovingUp = true;
  }
  // S 鍵往下
  if (key === 's' || key === 'S') {
    isMovingDown = true;
  }
  // ~ 鍵回到最左邊（車頭貼齊左邊）
  if (key === '~' || keyCode === 192) {
    carPosX = 215 * carScale; // 215是車身中心到左緣
  }
  // 空白鍵煞車（慢速前進）
  if (key === ' ' || keyCode === 32) {
    isBraking = true;
  }
  // Shift 加速
  if (keyCode === SHIFT) {
    isBoosting = true;
  }
}

function keyReleased() {
  // D 鍵放開停止移動
  if (key === 'd' || key === 'D') {
    isMovingRight = false;
  }
  // W 鍵放開停止往上
  if (key === 'w' || key === 'W') {
    isMovingUp = false;
  }
  // S 鍵放開停止往下
  if (key === 's' || key === 'S') {
    isMovingDown = false;
  }
  // 空白鍵放開停止慢速前進
  if (key === ' ' || keyCode === 32) {
    isBraking = false;
  }
  // Shift 放開停止加速
  if (keyCode === SHIFT) {
    isBoosting = false;
  }
}

function mousePressed() {
  // 暫停狀態點擊
  if (isPaused) {
    // 繼續
    if (mouseX > resumeBtn.x && mouseX < resumeBtn.x + resumeBtn.w && mouseY > resumeBtn.y && mouseY < resumeBtn.y + resumeBtn.h) {
      isPaused = false;
      return;
    }
    // 返回大廳
    if (mouseX > lobbyBtn.x && mouseX < lobbyBtn.x + lobbyBtn.w && mouseY > lobbyBtn.y && mouseY < lobbyBtn.y + lobbyBtn.h) {
      // 重置並回大廳 (暫停模式)
      isStarted = false;
      isPaused = false;
      isTimeUp = false;
      isGameOver = false;
      deathCount = 0;
      refreshCount = 0;
      difficulty = '';
      showDiffMenu = false;
      otherCars = [];
      enemySpawnTimer = 0;
      refreshSeed = Math.floor(Math.random()*10000);
      carPosX = 215 * carScale;
      carPosY = height / 2;
      isMovingRight = isMovingUp = isMovingDown = isBraking = isBoosting = false;
      return;
    }
  }
  if (!isStarted) {
    // 語言按鈕點擊
    if (mouseX > langBtn.x && mouseX < langBtn.x + langBtn.w && mouseY > langBtn.y && mouseY < langBtn.y + langBtn.h) {
      language = language === 'en' ? 'zh' : 'en';
      return;
    }
    // START 按鈕點擊
    if (mouseX > startBtn.x && mouseX < startBtn.x + startBtn.w && mouseY > startBtn.y && mouseY < startBtn.y + startBtn.h) {
      isStarted = true;
      loop();
      startTime = millis();
      isTimeUp = false;
    }
    // 切換難度菜單
    if(mouseX>diffBtn.x&&mouseX<diffBtn.x+diffBtn.w&&mouseY>diffBtn.y&&mouseY<diffBtn.y+diffBtn.h){ 
      showDiffMenu=!showDiffMenu; 
      return; 
    }
    if(showDiffMenu){
      if(mouseX>easyBtn.x&&mouseY>easyBtn.y&&mouseX<easyBtn.x+easyBtn.w&&mouseY<easyBtn.y+easyBtn.h){ 
        difficulty='easy';maxDeaths=30;timerDuration=15*60000; 
        showDiffMenu=false; 
        return; 
      }
      if(mouseX>normalBtn.x&&mouseY>normalBtn.y&&mouseX<normalBtn.x+normalBtn.w&&mouseY<normalBtn.y+normalBtn.h){ 
        difficulty='normal';maxDeaths=20;timerDuration=10*60000; 
        showDiffMenu=false; 
        return; 
      }
      if(mouseX>hardBtn.x&&mouseY>hardBtn.y&&mouseX<hardBtn.x+hardBtn.w&&mouseY<hardBtn.y+hardBtn.h){ 
        difficulty='hard';maxDeaths=10;timerDuration=5*60000; 
        showDiffMenu=false; 
        return; 
      }
    }
    return;
  }
  // game over 返回大廳
  if ((isTimeUp || isGameOver) && mouseX > lobbyBtn.x && mouseX < lobbyBtn.x + lobbyBtn.w && mouseY > lobbyBtn.y && mouseY < lobbyBtn.y + lobbyBtn.h) {
    // 重置並回大廳
    isStarted = false;
    isPaused = false;
    isTimeUp = false;
    isGameOver = false;
    // 重置計數與狀態
    deathCount = 0;
    refreshCount = 0;
    difficulty = '';
    showDiffMenu = false;
    // 重置遊戲元素
    otherCars = [];
    enemySpawnTimer = 0;
    refreshSeed = Math.floor(Math.random()*10000);
    // 車輛位置重置
    carPosX = 215 * carScale;
    carPosY = height / 2;
    isMovingRight = isMovingUp = isMovingDown = isBraking = isBoosting = false;
    loop();
    return;
  }
  // 手機版觸控邏輯
  if (isMobile && isStarted && !isPaused) {
    if (mouseX > upBtn.x && mouseX < upBtn.x + upBtn.w && mouseY > upBtn.y && mouseY < upBtn.y + upBtn.h) isMovingUp = true;
    if (mouseX > downBtn.x && mouseX < downBtn.x + downBtn.w && mouseY > downBtn.y && mouseY < downBtn.y + downBtn.h) isMovingDown = true;
    if (mouseX > rightBtn.x && mouseX < rightBtn.x + rightBtn.w && mouseY > rightBtn.y && mouseY < rightBtn.y + rightBtn.h) isMovingRight = true;
    if (mouseX > brakeBtn.x && mouseX < brakeBtn.x + brakeBtn.w && mouseY > brakeBtn.y && mouseY < brakeBtn.y + brakeBtn.h) isBraking = true;
    if (mouseX > pauseBtn.x && mouseX < pauseBtn.x + pauseBtn.w && mouseY > pauseBtn.y && mouseY < pauseBtn.y + pauseBtn.h) { isPaused = true; return; }
  }
}

function mouseReleased() {
  // 手機版放開觸控取消動作
  if (isMobile) {
    isMovingUp = isMovingDown = isMovingRight = isBraking = false;
  }
}

function windowResized() {
  // 更新按鈕位置
  let midX = width/2;
  startBtn.x = midX - startBtn.w/2;
  startBtn.y = height/2 - startBtn.h/2;
  langBtn.x = midX - langBtn.w/2;
  langBtn.y = startBtn.y + startBtn.h + 20;
  diffBtn.x = midX - diffBtn.w/2;
  diffBtn.y = langBtn.y + langBtn.h + 20;
  // difficulty buttons inside menu
  easyBtn.x = midX - easyBtn.w/2;
  normalBtn.x = easyBtn.x;
  hardBtn.x = easyBtn.x;
  easyBtn.y = diffBtn.y + diffBtn.h + 10;
  normalBtn.y = easyBtn.y + easyBtn.h + 10;
  hardBtn.y = normalBtn.y + normalBtn.h + 10;
  // 更新暫停選單按鈕位置
  resumeBtn.x = width/2 - resumeBtn.w/2;
  resumeBtn.y = height/3 - resumeBtn.h/2;
  lobbyBtn.x = width/2 - lobbyBtn.w/2;
  lobbyBtn.y = resumeBtn.y + resumeBtn.h + 20;

  if (isMobile) {
    let m = 20, bw = 60, bh = 60;
    upBtn.y = height - 3*(bh + m);
    downBtn.y = height - 2*(bh + m);
    rightBtn.y = height - (bh + m);
    brakeBtn.x = pauseBtn.x = width - bw - m;
    brakeBtn.y = height - (bh + m);
    pauseBtn.y = height - 2*(bh + m);
  }
}

// isEnemy: true=敵車(藍色)，false=玩家(紅色)
function drawSportsCar(x, y, s, isEnemy) {
  push();
  translate(x, y);
  scale(isEnemy ? s : s * 0.7); // 玩家車再縮小
  // 將原點移到車身中心（約250, 120）
  translate(-250, -120);

  // --- 碰撞體積框 ---
  // 剛好包住車身主體（寬430，高100，以車身中心為原點）
  push();
  noFill();
  stroke(isEnemy ? 'blue' : 'red');
  strokeWeight(3);
  rect(250 - 215, 120 - 50, 430, 100, 14); // 以車身中心為原點
  pop();

  // 陰影
  noStroke();
  fill(80, 100, 120, 60);
  ellipse(220, 90, 350, 40);

  // 車身下半部
  fill(isEnemy ? color(60,120,230) : color(220,30,40));
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

  // --- 玩家車高光 ---
  if (!isEnemy) {
    noStroke();
    fill(255,255,255,170);
    ellipse(250, 85, 120, 22); // 正面大高光
    fill(255,255,255,100);
    ellipse(380, 110, 60, 15); // 側面小高光
  }

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

document.addEventListener("DOMContentLoaded", function () {

  // ---- Clock ----
  function updateTime() {
    var currentTime = new Date().toLocaleString();
    var Timetext = document.querySelector("#timeElement");
    if (Timetext) Timetext.innerHTML = currentTime;
  }
  setInterval(updateTime, 1000);
  updateTime();

  // ---- Dragging (targets the real header id directly) ----
  var windowEl = document.getElementById("window");
  if (windowEl) {
    dragElement(windowEl, "mydivheader");
  }

  function dragElement(element, headerId) {
    var initialX = 0, initialY = 0, currentX = 0, currentY = 0;
    var header = headerId ? document.getElementById(headerId) : null;

    if (header) {
      header.onmousedown = startDragging;
    } else {
      element.onmousedown = startDragging;
    }

    function startDragging(e) {
      e = e || window.event;
      e.preventDefault();
      initialX = e.clientX;
      initialY = e.clientY;
      document.onmouseup = stopDragging;
      document.onmousemove = elementDrag;
    }

    function elementDrag(e) {
      e = e || window.event;
      e.preventDefault();
      currentX = initialX - e.clientX;
      currentY = initialY - e.clientY;
      initialX = e.clientX;
      initialY = e.clientY;
      element.style.top = (element.offsetTop - currentY) + "px";
      element.style.left = (element.offsetLeft - currentX) + "px";
    }

    function stopDragging() {
      document.onmouseup = null;
      document.onmousemove = null;
    }
  }

  // drag variant that takes the header element directly (no id lookup needed)
  function dragElementDirect(element, header) {
    var initialX = 0, initialY = 0, currentX = 0, currentY = 0;

    header.onmousedown = startDragging;

    function startDragging(e) {
      e.preventDefault();
      initialX = e.clientX;
      initialY = e.clientY;
      document.onmouseup = stopDragging;
      document.onmousemove = drag;
    }

    function drag(e) {
      e.preventDefault();
      currentX = initialX - e.clientX;
      currentY = initialY - e.clientY;
      initialX = e.clientX;
      initialY = e.clientY;
      element.style.top = (element.offsetTop - currentY) + "px";
      element.style.left = (element.offsetLeft - currentX) + "px";
    }

    function stopDragging() {
      document.onmouseup = null;
      document.onmousemove = null;
    }
  }

  // ---- Window open/close ----
  var welcomeScreen = document.querySelector("#window");
  var welcomeScreenClose = document.querySelector("#welcomeclose");
  var welcomeOpenBtn = document.querySelector("#welcomeopen");

  function closeWindow(element) {
    if (element) element.style.display = "none";
  }

  function openWindow(element) {
    if (element) element.style.display = "flex";
  }

  if (welcomeScreenClose) {
    welcomeScreenClose.addEventListener("click", function () {
      closeWindow(welcomeScreen);
    });
  }

  // ---- Generic app window creator ----
  function createAppWindow(title, contentHTML, options) {
    options = options || {};
    var win = document.createElement("div");
    win.className = "app-window";
    win.style.position = "absolute";
    win.style.top = (options.top || 120) + "px";
    win.style.left = (options.left || 150) + "px";
    win.style.width = (options.width || 260) + "px";

    var header = document.createElement("div");
    header.className = "app-window-header";

    var titleSpan = document.createElement("span");
    titleSpan.textContent = title;

    var closeBtn = document.createElement("span");
    closeBtn.className = "app-window-close";
    closeBtn.textContent = "✕";
    closeBtn.onclick = function () {
      win.remove();
    };

    header.appendChild(titleSpan);
    header.appendChild(closeBtn);

    var body = document.createElement("div");
    body.className = "app-window-body";
    body.innerHTML = contentHTML;

    win.appendChild(header);
    win.appendChild(body);
    document.body.appendChild(win);

    dragElementDirect(win, header);

    return win;
  }

  // ---- Calculator app ----
  function openCalculator() {
    var html =
      '<input type="text" id="calcScreen" readonly style="width:100%;box-sizing:border-box;margin-bottom:4px;text-align:right;font-size:16px;">' +
      '<div class="calc-grid">' +
      ['7','8','9','/','4','5','6','*','1','2','3','-','0','.','=','+'].map(function(k) {
        return '<button class="calc-btn" data-key="' + k + '">' + k + '</button>';
      }).join('') +
      '<button class="calc-btn calc-clear" data-key="C">C</button>' +
      '</div>';

    var win = createAppWindow("Calculator", html, { top: 140, left: 400, width: 200 });
    var screen = win.querySelector("#calcScreen");
    var expression = "";

    win.querySelectorAll(".calc-btn").forEach(function (btn) {
      btn.addEventListener("click", function () {
        var key = btn.getAttribute("data-key");
        if (key === "C") {
          expression = "";
        } else if (key === "=") {
          try {
            expression = String(Function('"use strict";return (' + expression + ')')());
          } catch (err) {
            expression = "Error";
          }
        } else {
          expression += key;
        }
        screen.value = expression;
      });
    });
  }

  // ---- Notepad app ----
  function openNotepad() {
    var saved = localStorage.getItem("dreamOSNotepad") || "";
    var html =
      '<textarea id="notepadArea" style="width:100%;height:150px;box-sizing:border-box;font-family:monospace;resize:none;">' +
      saved + '</textarea>' +
      '<div id="notepadStatus" style="font-size:11px;color:#555;margin-top:4px;">Saved ✓</div>';

    var win = createAppWindow("Notepad", html, { top: 160, left: 420, width: 260 });
    var area = win.querySelector("#notepadArea");
    var status = win.querySelector("#notepadStatus");
    var saveTimeout;

    area.addEventListener("input", function () {
      status.textContent = "Saving...";
      clearTimeout(saveTimeout);
      saveTimeout = setTimeout(function () {
        localStorage.setItem("dreamOSNotepad", area.value);
        status.textContent = "Saved ✓";
      }, 500);
    });
  }

  // ---- Insta Feed app ----
  function openInstaScroller() {
    var posts = "";
    var colors = ["#e0bbff","#a3d5ff","#ffd6a5","#b5ead7","#ffb3ba","#c7ceea"];
    for (var i = 0; i < 12; i++) {
      posts += '<div class="insta-post">' +
        '<div class="insta-post-img" style="background:' + colors[i % colors.length] + ';"></div>' +
        '<strong>user_' + (100 + i) + '</strong> — just vibing in the Backrooms 🌫️' +
        '</div>';
    }
    var html = '<div id="instaFeed">' + posts + '</div>';
    var win = createAppWindow("Insta Feed", html, { top: 130, left: 300, width: 260 });
    var feed = win.querySelector("#instaFeed");

    var scrollInterval = setInterval(function () {
      feed.scrollTop += 1;
      if (feed.scrollTop + feed.clientHeight >= feed.scrollHeight) {
        feed.scrollTop = 0;
      }
    }, 40);

    feed.addEventListener("mouseenter", function () { clearInterval(scrollInterval); });
    feed.addEventListener("mouseleave", function () {
      scrollInterval = setInterval(function () {
        feed.scrollTop += 1;
        if (feed.scrollTop + feed.clientHeight >= feed.scrollHeight) {
          feed.scrollTop = 0;
        }
      }, 40);
    });
  }

  // ---- YouTube app ----
  function openYouTube() {
    var html =
      '<iframe width="100%" height="180" src="https://www.youtube.com/embed?listType=user_uploads" ' +
      'frameborder="0" allow="autoplay; encrypted-media" allowfullscreen></iframe>';
    createAppWindow("YouTube", html, { top: 130, left: 300, width: 320 });
  }

  // ---- Timer app ----
  function openTimer() {
    var html =
      '<div style="text-align:center;">' +
      '<input type="number" id="timerMinutes" placeholder="min" style="width:50px;" min="0"> :' +
      '<input type="number" id="timerSeconds" placeholder="sec" style="width:50px;" min="0" max="59">' +
      '<div id="timerDisplay" style="font-size:28px;font-family:monospace;margin:10px 0;">00:00</div>' +
      '<button id="timerStart">Start</button> ' +
      '<button id="timerReset">Reset</button>' +
      '</div>';

    var win = createAppWindow("Timer", html, { top: 150, left: 350, width: 200 });
    var display = win.querySelector("#timerDisplay");
    var minInput = win.querySelector("#timerMinutes");
    var secInput = win.querySelector("#timerSeconds");
    var startBtn = win.querySelector("#timerStart");
    var resetBtn = win.querySelector("#timerReset");

    var totalSeconds = 0;
    var interval = null;

    function updateDisplay() {
      var m = Math.floor(totalSeconds / 60);
      var s = totalSeconds % 60;
      display.textContent =
        (m < 10 ? "0" + m : m) + ":" + (s < 10 ? "0" + s : s);
    }

    startBtn.addEventListener("click", function () {
      if (interval) return;

      if (totalSeconds === 0) {
        var mins = parseInt(minInput.value) || 0;
        var secs = parseInt(secInput.value) || 0;
        totalSeconds = mins * 60 + secs;
        if (totalSeconds <= 0) return;
      }

      updateDisplay();
      interval = setInterval(function () {
        totalSeconds--;
        updateDisplay();
        if (totalSeconds <= 0) {
          clearInterval(interval);
          interval = null;
          display.textContent = "TIME UP!";
        }
      }, 1000);
    });

    resetBtn.addEventListener("click", function () {
      clearInterval(interval);
      interval = null;
      totalSeconds = 0;
      minInput.value = "";
      secInput.value = "";
      display.textContent = "00:00";
    });
  }

  // ---- Stopwatch app ----
  function openStopwatch() {
    var html =
      '<div style="text-align:center;">' +
      '<div id="stopwatchDisplay" style="font-size:28px;font-family:monospace;margin:10px 0;">00:00.0</div>' +
      '<button id="swStart">Start</button> ' +
      '<button id="swStop">Stop</button> ' +
      '<button id="swReset">Reset</button>' +
      '</div>';

    var win = createAppWindow("Stopwatch", html, { top: 150, left: 350, width: 200 });
    var display = win.querySelector("#stopwatchDisplay");
    var startBtn = win.querySelector("#swStart");
    var stopBtn = win.querySelector("#swStop");
    var resetBtn = win.querySelector("#swReset");

    var elapsedMs = 0;
    var startTime = null;
    var interval = null;

    function updateDisplay() {
      var current = elapsedMs + (startTime ? Date.now() - startTime : 0);
      var m = Math.floor(current / 60000);
      var s = Math.floor((current % 60000) / 1000);
      var tenths = Math.floor((current % 1000) / 100);
      display.textContent =
        (m < 10 ? "0" + m : m) + ":" + (s < 10 ? "0" + s : s) + "." + tenths;
    }

    startBtn.addEventListener("click", function () {
      if (interval) return;
      startTime = Date.now();
      interval = setInterval(updateDisplay, 100);
    });

    stopBtn.addEventListener("click", function () {
      if (!interval) return;
      elapsedMs += Date.now() - startTime;
      startTime = null;
      clearInterval(interval);
      interval = null;
    });

    resetBtn.addEventListener("click", function () {
      clearInterval(interval);
      interval = null;
      elapsedMs = 0;
      startTime = null;
      display.textContent = "00:00.0";
    });
  }

  // ---- Snake game (resets after first horror message, repeats every death) ----
  function openSnake() {
    var html =
      '<canvas id="snakeCanvas" width="320" height="320"></canvas>' +
      '<p style="text-align:center;font-size:11px;color:#555;">Use arrow keys</p>';

    var win = createAppWindow("Snake", html, { top: 80, left: 300, width: 340 });
    var canvas = win.querySelector("#snakeCanvas");
    var ctx = canvas.getContext("2d");
    var gridSize = 16;
    var tileCount = canvas.width / gridSize;

    var snake, velocity, food, gameOver, gameInterval;

    function randomFood() {
      return {
        x: Math.floor(Math.random() * tileCount),
        y: Math.floor(Math.random() * tileCount)
      };
    }

    function resetGame() {
      snake = [{ x: 10, y: 10 }];
      velocity = { x: 0, y: 0 };
      food = randomFood();
      gameOver = false;
      draw();
    }

    function keyHandler(e) {
      if (gameOver) return;
      if (e.key === "ArrowUp" && velocity.y === 0) velocity = { x: 0, y: -1 };
      else if (e.key === "ArrowDown" && velocity.y === 0) velocity = { x: 0, y: 1 };
      else if (e.key === "ArrowLeft" && velocity.x === 0) velocity = { x: -1, y: 0 };
      else if (e.key === "ArrowRight" && velocity.x === 0) velocity = { x: 1, y: 0 };
    }
    document.addEventListener("keydown", keyHandler);

    function draw() {
      ctx.fillStyle = "#000";
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      ctx.fillStyle = "red";
      ctx.fillRect(food.x * gridSize, food.y * gridSize, gridSize, gridSize);

      ctx.fillStyle = "#0f0";
      snake.forEach(function (seg) {
        ctx.fillRect(seg.x * gridSize, seg.y * gridSize, gridSize - 1, gridSize - 1);
      });
    }

    function update() {
      if (gameOver) return;
      if (velocity.x === 0 && velocity.y === 0) return;

      var head = { x: snake[0].x + velocity.x, y: snake[0].y + velocity.y };

      var hitWall = head.x < 0 || head.x >= tileCount || head.y < 0 || head.y >= tileCount;
      var hitSelf = snake.some(function (seg) { return seg.x === head.x && seg.y === head.y; });

      if (hitWall || hitSelf) {
        triggerDeath();
        return;
      }

      snake.unshift(head);

      if (head.x === food.x && head.y === food.y) {
        food = randomFood();
      } else {
        snake.pop();
      }

      draw();
    }

    function triggerDeath() {
      gameOver = true;
      launchFullscreenHorror(resetGame);
    }

    resetGame();
    gameInterval = setInterval(update, 100);

    var closeBtn = win.querySelector(".app-window-close");
    if (closeBtn) {
      closeBtn.addEventListener("click", function () {
        clearInterval(gameInterval);
        document.removeEventListener("keydown", keyHandler);
      });
    }
  }

  function launchFullscreenHorror(onFirstStageComplete) {
    document.body.classList.add("snake-death-shake");

    var overlay = document.createElement("div");
    overlay.id = "snakeFullscreenOverlay";

    var fcanvas = document.createElement("canvas");
    fcanvas.id = "snakeFullCanvas";
    fcanvas.width = window.innerWidth;
    fcanvas.height = window.innerHeight;
    overlay.appendChild(fcanvas);
    document.body.appendChild(overlay);

    var fctx = fcanvas.getContext("2d");

    var segments = [];
    var segCount = 14;
    var segSize = 60;
    var posX = fcanvas.width / 2;
    var posY = fcanvas.height / 2;

    for (var i = 0; i < segCount; i++) {
      segments.push({ x: posX, y: posY });
    }

    var dashInterval = setInterval(function () {
      posX = Math.random() * fcanvas.width;
      posY = Math.random() * fcanvas.height;
      segments.unshift({ x: posX, y: posY });
      segments.pop();

      fctx.fillStyle = "#000";
      fctx.fillRect(0, 0, fcanvas.width, fcanvas.height);

      fctx.fillStyle = "#0f0";
      segments.forEach(function (seg, idx) {
        var size = segSize - idx * 2;
        if (size < 10) size = 10;
        fctx.fillRect(seg.x - size / 2, seg.y - size / 2, size, size);
      });
    }, 90);

    var blinkText = document.createElement("div");
    blinkText.className = "snake-blink-text";
    overlay.appendChild(blinkText);

    var stages = [
      { text: "it's okay", duration: 1200 },
      { text: "DON'T MAKE THE MISTAKE AGAIN", duration: 1200 },
      { text: "I TOLD U NOT TO", duration: 1200 },
      { text: "LEAVE ME ALONE", duration: 1500 }
    ];

    var stageIndex = 0;

    function runStage() {
      if (stageIndex >= stages.length) {
        clearInterval(dashInterval);
        document.body.classList.remove("snake-death-shake");
        overlay.remove();
        return;
      }

      var stage = stages[stageIndex];
      blinkText.textContent = stage.text;

      if (stageIndex === 0) {
        blinkText.style.animation = "none";
        blinkText.style.fontSize = "36px";
        blinkText.style.color = "#fff";
        blinkText.style.textShadow = "none";

        if (typeof onFirstStageComplete === "function") {
          onFirstStageComplete();
        }
      } else if (stageIndex === 1) {
        blinkText.style.animation = "hardBlink 0.4s steps(1) infinite";
        blinkText.style.fontSize = "42px";
        blinkText.style.color = "red";
        blinkText.style.textShadow = "0 0 15px red";
      } else if (stageIndex === 2) {
        blinkText.style.animation = "hardBlink 0.2s steps(1) infinite";
        blinkText.style.fontSize = "50px";
        blinkText.style.color = "red";
        blinkText.style.textShadow = "0 0 20px red, 0 0 40px red";
      } else {
        blinkText.style.animation = "hardBlink 0.1s steps(1) infinite";
        blinkText.style.fontSize = "60px";
        blinkText.style.color = "red";
        blinkText.style.textShadow = "0 0 25px red, 0 0 50px red";
      }

      stageIndex++;
      setTimeout(runStage, stage.duration);
    }

    runStage();
  }

  // ---- Jumpscare sequence ("Don't Click") ----
  function startJumpscare() {
    document.body.classList.add("jumpscare-shake");

    var overlay = document.createElement("div");
    overlay.id = "jumpscareOverlay";
    document.body.appendChild(overlay);

    var message = "U SHOULDNT HAVE CLICKED THIS";
    var textCount = 0;
    var maxTexts = 8;

    var textInterval = setInterval(function () {
      var text = document.createElement("div");
      text.className = "jumpscare-text";
      text.textContent = message;
      text.style.top = Math.random() * 90 + "%";
      text.style.left = "-400px";
      document.body.appendChild(text);

      var pos = -400;
      var moveInterval = setInterval(function () {
        pos += 40;
        text.style.left = pos + "px";
        if (pos > window.innerWidth + 400) {
          clearInterval(moveInterval);
          text.remove();
        }
      }, 16);

      textCount++;
      if (textCount >= maxTexts) {
        clearInterval(textInterval);
        setTimeout(spawnEscapeWindows, 500);
      }
    }, 400);
  }

  function spawnEscapeWindows() {
    var windowCount = 0;
    var maxWindows = 10;

    var spawnInterval = setInterval(function () {
      var win = document.createElement("div");
      win.className = "escape-window";
      win.style.top = Math.random() * (window.innerHeight - 100) + "px";
      win.style.left = Math.random() * (window.innerWidth - 200) + "px";
      win.innerHTML =
        '<div class="escape-window-header">EXIT</div>' +
        '<div class="escape-window-body">THERE IS NO ESCAPE</div>';
      document.body.appendChild(win);

      var jitter = setInterval(function () {
        win.style.top = (parseFloat(win.style.top) + (Math.random() * 20 - 10)) + "px";
        win.style.left = (parseFloat(win.style.left) + (Math.random() * 20 - 10)) + "px";
      }, 100);
      win.dataset.jitterId = jitter;

      windowCount++;
      if (windowCount >= maxWindows) {
        clearInterval(spawnInterval);
        setTimeout(endJumpscare, 1500);
      }
    }, 250);
  }

  function endJumpscare() {
    document.body.classList.remove("jumpscare-shake");
    var overlay = document.getElementById("jumpscareOverlay");
    if (overlay) overlay.remove();

    document.querySelectorAll(".escape-window").forEach(function (w) { w.remove(); });
    document.querySelectorAll(".jumpscare-text").forEach(function (t) { t.remove(); });

    var holdOverlay = document.createElement("div");
    holdOverlay.id = "holdMyHandOverlay";

    var win = document.createElement("div");
    win.className = "escape-window";
    win.style.position = "static";
    win.innerHTML =
      '<div class="escape-window-header">???</div>' +
      '<div class="escape-window-body">HOLD MY HAND<br><br><button id="holdYesBtn">yes</button></div>';

    holdOverlay.appendChild(win);
    document.body.appendChild(holdOverlay);

    document.getElementById("holdYesBtn").addEventListener("click", function () {
      holdOverlay.remove();
      showBlackout();
    });
  }

  function showBlackout() {
    var blackout = document.createElement("div");
    blackout.id = "blackoutScreen";
    blackout.textContent = "You are safe for now.";
    document.body.appendChild(blackout);

    requestAnimationFrame(function () {
      blackout.classList.add("show");
    });

    setTimeout(function () {
      blackout.remove();
      openWindow(welcomeScreen);
    }, 2500);
  }

  // ---- Shutdown sequence (escalating, with real power off/on) ----
  var shutdownAttempts = 0;

  function handleShutdownClick() {
    shutdownAttempts++;
    if (shutdownAttempts === 1) {
      showShutdownConfirm();
    } else if (shutdownAttempts === 2) {
      showRegretMessage();
    } else {
      startFinalShutdownScare();
    }
  }

  function showShutdownConfirm() {
    var win = createAppWindow(
      "Shut Down",
      '<p style="text-align:center;">Are you sure you want to shut down?</p>' +
      '<div style="text-align:center;"><button id="sdYes">Yes</button> <button id="sdNo">No</button></div>',
      { top: 180, left: 380, width: 220 }
    );
    win.querySelector("#sdYes").onclick = function () {
      win.remove();
      powerOffSequence();
    };
    win.querySelector("#sdNo").onclick = function () {
      win.remove();
      shutdownAttempts = 0;
    };
  }

  function powerOffSequence() {
    document.body.classList.add("screen-off-fx");

    var shutting = document.createElement("div");
    shutting.id = "shuttingDownScreen";
    shutting.innerHTML = "Shutting down...<div class='spinner'></div>";
    document.body.appendChild(shutting);
    requestAnimationFrame(function () { shutting.classList.add("show"); });

    setTimeout(function () {
      shutting.remove();
      document.body.classList.remove("screen-off-fx");
      showPowerOffScreen();
    }, 1800);
  }

  function showPowerOffScreen() {
    document.getElementById("bodystyle").style.visibility = "hidden";

    var offScreen = document.createElement("div");
    offScreen.id = "powerOffScreen";
    offScreen.innerHTML = '<div class="power-btn">⏻</div>';
    document.body.appendChild(offScreen);

    offScreen.addEventListener("click", function () {
      offScreen.remove();
      document.getElementById("bodystyle").style.visibility = "visible";
      shutdownAttempts = 0;
      openWindow(welcomeScreen);
    });
  }

  function showRegretMessage() {
    document.body.classList.add("jumpscare-shake");
    var overlay = document.createElement("div");
    overlay.id = "regretOverlay";
    var text = document.createElement("div");
    text.id = "regretText";
    text.textContent = "ARE YOU SURE YOU WOULDN'T REGRET THIS?";
    overlay.appendChild(text);
    document.body.appendChild(overlay);

    setTimeout(function () {
      overlay.remove();
      document.body.classList.remove("jumpscare-shake");
    }, 2800);
  }

  function startFinalShutdownScare() {
    document.body.classList.add("jumpscare-shake");
    var overlay = document.createElement("div");
    overlay.id = "finalScareOverlay";
    document.body.appendChild(overlay);

    for (var i = 0; i < 25; i++) {
      var eye = document.createElement("img");
      eye.src = "images/eye.png";
      eye.className = "eye-icon";
      eye.style.top = Math.random() * 90 + "%";
      eye.style.left = Math.random() * 90 + "%";
      overlay.appendChild(eye);
    }

    var figure = document.createElement("div");
    figure.className = "black-figure";
    overlay.appendChild(figure);
    setTimeout(function () { figure.classList.add("show"); }, 300);

    var count = 0;
    var errInterval = setInterval(function () {
      var errWin = document.createElement("div");
      errWin.className = "stack-error-window";
      errWin.style.top = (20 + count * 15) + "px";
      errWin.style.left = (window.innerWidth / 2 - 100 + count * 12) + "px";
      errWin.innerHTML =
        '<div class="stack-error-header"><span>Error</span><span>✕</span></div>' +
        '<div class="stack-error-body">Fail<br><button>OK</button></div>';
      overlay.appendChild(errWin);
      count++;
      if (count >= 12) {
        clearInterval(errInterval);
        setTimeout(cutToShutdown, 1800);
      }
    }, 200);

    function cutToShutdown() {
      overlay.remove();
      document.body.classList.remove("jumpscare-shake");
      showCustomShutdownScreen();
    }
  }

  function showCustomShutdownScreen() {
    document.body.classList.add("intense-shake");

    var screen = document.createElement("div");
    screen.id = "customShutdown";

    var noise = document.createElement("div");
    noise.id = "staticNoise";

    var textBox = document.createElement("div");
    textBox.id = "shutdownText";
    textBox.innerHTML = "DREAM_OS<br>SYSTEM HALTED.";

    screen.appendChild(noise);
    screen.appendChild(textBox);
    document.body.appendChild(screen);

    requestAnimationFrame(function () {
      screen.classList.add("show");
      screen.classList.add("glitching");
    });

    var messages = [
      "DREAM_OS<br>SYSTEM HALTED.",
      "IT WAS NEVER SAFE HERE.",
      "WE SAW YOU LEAVE.",
      "<span class='data-corrupt'>DELETING YOUR FILES...</span>",
      "<span class='data-corrupt'>NOTEPAD.TXT — CORRUPTED</span>",
      "JUST KIDDING.",
      "COME BACK SOON."
    ];

    var i = 0;
    var msgInterval = setInterval(function () {
      textBox.innerHTML = messages[i] + '<br><span class="blink">_</span>';
      i++;
      if (i >= messages.length) {
        clearInterval(msgInterval);
        finishShutdown();
      }
    }, 900);

    function finishShutdown() {
      setTimeout(function () {
        screen.classList.remove("show");
        document.body.classList.remove("intense-shake");
        setTimeout(function () {
          screen.remove();
          shutdownAttempts = 0;
          openWindow(welcomeScreen);
        }, 400);
      }, 1200);
    }
  }

  // ---- Start-style dropdown menu (Dream_oS button) ----
  if (welcomeOpenBtn) {
    var startMenu = document.createElement("div");
    startMenu.id = "startMenu";
    startMenu.style.display = "none";

    var menuItemsContainer = document.createElement("div");
    menuItemsContainer.id = "startMenuItems";

    var menuItems = [
      { label: "Open Dream OS", icon: "🖥️", action: function () { openWindow(welcomeScreen); } },
      { label: "Calculator", icon: "🧮", action: function () { openCalculator(); } },
      { label: "Snake", icon: "🐍", action: function () { openSnake(); } },
      { label: "Notepad", icon: "📝", action: function () { openNotepad(); } },
      { label: "YouTube", icon: "▶️", action: function () { openYouTube(); } },
      { label: "Timer", icon: "⏲️", action: function () { openTimer(); } },
      { label: "Stopwatch", icon: "⏱️", action: function () { openStopwatch(); } },
      { label: "About", icon: "ℹ️", action: function () { alert("Dream_oS v1.0"); } },
      { label: "Don't Click", icon: "⚠️", action: function () { startJumpscare(); } },
      { label: "Shut Down", icon: "⏻", divider: true, action: function () { handleShutdownClick(); } }
    ];

    menuItems.forEach(function (item) {
      if (item.divider) {
        var divider = document.createElement("div");
        divider.className = "menuDivider";
        menuItemsContainer.appendChild(divider);
      }

      var menuItem = document.createElement("div");
      menuItem.className = "startMenuItem";

      var icon = document.createElement("span");
      icon.className = "menuIcon";
      icon.textContent = item.icon;

      var label = document.createElement("span");
      label.textContent = item.label;

      menuItem.appendChild(icon);
      menuItem.appendChild(label);

      menuItem.onclick = function () {
        item.action();
        startMenu.style.display = "none";
      };

      menuItemsContainer.appendChild(menuItem);
    });

    startMenu.appendChild(menuItemsContainer);
    document.body.appendChild(startMenu);

    welcomeOpenBtn.addEventListener("click", function (e) {
      e.stopPropagation();
      startMenu.style.display = startMenu.style.display === "none" ? "flex" : "none";

      var rect = this.getBoundingClientRect();
      startMenu.style.top = rect.bottom + "px";
      startMenu.style.left = rect.left + "px";
    });

    document.addEventListener("click", function () {
      startMenu.style.display = "none";
    });
  }

});
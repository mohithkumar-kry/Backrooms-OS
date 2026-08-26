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
    var html = '<textarea id="notepadArea" style="width:100%;height:150px;box-sizing:border-box;font-family:monospace;resize:none;"></textarea>';
    createAppWindow("Notepad", html, { top: 160, left: 420, width: 260 });
  }

  // ---- YouTube app ----
  function openYouTube() {
    var html =
      '<iframe width="100%" height="180" src="https://www.youtube.com/embed?listType=user_uploads" ' +
      'frameborder="0" allow="autoplay; encrypted-media" allowfullscreen></iframe>';
    createAppWindow("YouTube", html, { top: 130, left: 300, width: 320 });
  }

  // ---- Jumpscare sequence ----
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
      { label: "Notepad", icon: "📝", action: function () { openNotepad(); } },
      { label: "YouTube", icon: "▶️", action: function () { openYouTube(); } },
      { label: "About", icon: "ℹ️", action: function () { alert("Dream_oS v1.0"); } },
      { label: "Don't Click", icon: "⚠️", action: function () { startJumpscare(); } },
      {
        label: "Shut Down", icon: "⏻", divider: true, action: function () {
          var body = document.getElementById("bodystyle");
          if (body) {
            body.innerHTML =
              "<h1 style='color:white;text-align:center;margin-top:200px;'>It's now safe to close this tab.</h1>";
          }
        }
      }
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
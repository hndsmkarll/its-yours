/* ============================================================
   EDIT THIS PART: make it personal!
   ============================================================ */
const CONFIG = {
  name: "lablabb",              
  from: "Karl Lagrada",         
  signOff: "Only yours,",       
  passcode: "i love you",       
  clue: "HINT: three words lablabb, after sweetdreamss.",  
  speechLang: "en-US",          
  bunnyMessage: "Wanna make it more romantic? Touch me!!",
  
  photos: [
    "images/photo1.jpg", "images/photo2.jpg", "images/photo3.jpg", 
    "images/photo4.jpg", "images/photo5.jpg", "images/photo6.jpg", 
    "images/photo7.jpg", "images/photo8.jpg", "images/photo9.jpg", 
    "images/photo10.jpg", "images/photo11.jpg"
  ],

  letter:
`First and foremost, I want to thank God for letting me know you. I want to thank Him for giving such a wonderful blessing, an unexpected girl who will have a very big part in my life. I want to thank Him for giving me a reason to smile every day, a reason to fight every day because I have the person I can rest at the end of the day.

Happy Birthday lablabb, I just want to tell you that you are one of the biggest, unexpected blessing God gave me. I also want to tell you that having you everyday was the best part of my every day. Thank you for always being there for me, thank you for always checking up on me. Only if you know how much you always completed my every day.

I want to say sorry for all the times that I wasn't there when you need me the most. I may not be the best man that you deserved but I will always do my part as your man. I want you to know that even on days that I'm not around, you don't need to worry because you won't lose me anyway. I may be busy usually but that doesn't mean you're not important, trust me when I say that you are.

I won't take this long na lablab, basta I'm always here lang for you, anytime, everytime, and every day. Enjoy your day and I hope this will fill your day also. I love you so much lablab. May God bless you more and your family. Always keep your cute smile, stay what you really are. Again, Happy Happy birthday palanggaaa.`
};

/* ============================================================
   Code below: you don't need to change anything
   ============================================================ */
const $ = (id) => document.getElementById(id);
const reduceMotion = matchMedia("(prefers-reduced-motion: reduce)").matches;

// CHANGED TAB TITLE
document.title = "Only You";

$("modalTitle").textContent = "Nice onee, " + CONFIG.name;
$("letterSignOff").textContent = CONFIG.signOff;
$("letterFrom").textContent = CONFIG.from;
$("bunnyBubble").querySelector(".bunny-bubble-inner").textContent = CONFIG.bunnyMessage;
$("bunny").setAttribute("aria-label", CONFIG.bunnyMessage);

// Preload the audio file as soon as the page loads
window.addEventListener("load", () => {
  const music = $("bgMusic");
  if (music) music.load();
});

// Confetti
const canvas = $("confetti");
const ctx = canvas.getContext("2d");
let pieces = [];
let running = false;

function resize() {
  canvas.width = innerWidth;
  canvas.height = innerHeight;
}
addEventListener("resize", resize);
resize();

function burst(count = 160) {
  const colors = ["#ff7fae", "#ffa6c9", "#d63a73", "#ff5c93", "#ffc2da"];
  for (let i = 0; i < count; i++) {
    pieces.push({
      x: innerWidth / 2,
      y: innerHeight / 2,
      vx: (Math.random() - 0.5) * 16,
      vy: Math.random() * -14 - 2,
      size: Math.random() * 7 + 4,
      color: colors[Math.floor(Math.random() * colors.length)],
      rot: Math.random() * 6,
      life: 0
    });
  }
  if (!running) { running = true; requestAnimationFrame(tick); }
}

function burstAt(x, y, count = 90) {
  const colors = ["#ff7fae", "#ffa6c9", "#d63a73", "#ff5c93", "#ffc2da"];
  for (let i = 0; i < count; i++) {
    pieces.push({
      x, y,
      vx: (Math.random() - 0.5) * 14,
      vy: Math.random() * -12 - 2,
      size: Math.random() * 6 + 3,
      color: colors[Math.floor(Math.random() * colors.length)],
      rot: Math.random() * 6,
      life: 0
    });
  }
  if (!running) { running = true; requestAnimationFrame(tick); }
}

function tick() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  pieces.forEach((p) => {
    p.vy += 0.3; p.x += p.vx; p.y += p.vy; p.rot += 0.1; p.life++;
    ctx.save();
    ctx.translate(p.x, p.y);
    ctx.rotate(p.rot);
    ctx.fillStyle = p.color;
    ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size * 0.6);
    ctx.restore();
  });
  pieces = pieces.filter((p) => p.y < canvas.height + 20 && p.life < 300);
  if (pieces.length) requestAnimationFrame(tick);
  else { running = false; ctx.clearRect(0, 0, canvas.width, canvas.height); }
}

/* ============================================================
   Letter card + typewriter
   ============================================================ */
function startLetter() {
  const card = $("letterCard");
  const paper = card.querySelector(".letter-paper");
  const body = $("letterText");
  const sign = $("letterSign");
  const skip = $("letterSkip");
  const text = CONFIG.letter;

  let done = false;
  let rafId = 0;

  function finish() {
    if (done) return;
    done = true;
    if (rafId) { cancelAnimationFrame(rafId); rafId = 0; }
    body.textContent = text;
    body.classList.add("done");
    sign.classList.add("show");
    skip.classList.remove("show");
    skip.classList.add("hide");
    if (paper.scrollTo) paper.scrollTo({ top: paper.scrollHeight, behavior: "smooth" });
    else paper.scrollTop = paper.scrollHeight;
  }

  if (reduceMotion) {
    body.textContent = text;
    body.classList.add("done");
    sign.classList.add("show");
    skip.classList.add("hide");
    return;
  }

  skip.classList.add("show");

  let i = 0;
  let last = performance.now();

  function type(now) {
    if (done) return;
    if (now - last >= 13 + Math.random() * 9) {
      last = now;
      body.textContent = text.slice(0, ++i);
      const nearBottom = paper.scrollHeight - paper.clientHeight - paper.scrollTop < 60;
      if (nearBottom) paper.scrollTop = paper.scrollHeight;
      if (i >= text.length) { finish(); return; }
    }
    rafId = requestAnimationFrame(type);
  }
  rafId = requestAnimationFrame(type);

  paper.setAttribute("tabindex", "0");
  paper.addEventListener("click", finish, { once: true });
  paper.addEventListener("keydown", (e) => {
    if (e.key === "Enter" || e.key === " ") { e.preventDefault(); finish(); }
  });
}

/* ============================================================
   Bunny, Music & Photo Rain
   ============================================================ */
let bunnyMoveTimer = null;

function showBunny() {
  const bunny = $("bunny");
  const bubble = $("bunnyBubble");
  bunny.classList.add("visible");

  setTimeout(() => {
    if (!bunny.classList.contains("tapped")) bubble.classList.add("show");
  }, 1200 + Math.random() * 1600);

  bunnyMoveTimer = setInterval(moveBunny, 3200);
}

function moveBunny() {
  const bunny = $("bunny");
  if (!bunny.classList.contains("visible") || bunny.classList.contains("tapped")) return;
  const narrow = innerWidth < 820;
  const base = narrow ? 62 : 68;
  const range = narrow ? 40 : 100;
  const offset = (Math.random() * 2 - 1) * range;
  bunny.style.left = `calc(${base}% + ${offset}px)`;
}

function spawnBunnyHeart(wrap) {
  const h = document.createElement("span");
  h.className = "bunny-heart";
  h.textContent = ["💖","💕","🌸","✨","💗","🌷"][Math.floor(Math.random() * 6)];
  h.style.setProperty("--dx", `${(Math.random() * 2 - 1) * 60}px`);
  h.style.setProperty("--delay", `${Math.random() * 0.25}s`);
  wrap.appendChild(h);
  setTimeout(() => h.remove(), 2400);
}

function playMusic() {
  const music = $("bgMusic");
  if (!music) return;
  
  music.currentTime = 0; 
  music.volume = 0.6;    
  music.play().catch((e) => {
    console.log("Audio playback prevented by browser:", e);
  });
}

let photoInterval = null;
let photoIndex = 0;

function startPhotoRain() {
  const rain = $("photoRain");
  if (rain.dataset.started) return;
  rain.dataset.started = "1";

  spawnFallingPhoto();
  photoInterval = setInterval(spawnFallingPhoto, 2500);
}

function spawnFallingPhoto() {
  const rain = $("photoRain");
  const photos = CONFIG.photos;
  const imgSrc = photos[photoIndex % photos.length];
  
  const wrap = document.createElement("div");
  wrap.className = "falling-photo";
  
  const img = document.createElement("img");
  img.src = imgSrc;
  img.alt = "Our memory";
  wrap.appendChild(img);

  const isLeftLane = photoIndex % 2 === 0;
  const leftPos = isLeftLane 
    ? (Math.random() * 15 + 15) + "%"
    : (Math.random() * 15 + 60) + "%";
  
  wrap.style.left = leftPos;
  
  wrap.style.setProperty("--sway", `${(Math.random() * 2 - 1) * 50}px`);
  wrap.style.setProperty("--rot", `${(Math.random() * 2 - 1) * 20}deg`);
  const duration = 8 + Math.random() * 3;
  wrap.style.setProperty("--duration", `${duration}s`);

  rain.appendChild(wrap);
  photoIndex++;

  setTimeout(() => {
    if (wrap.parentNode) wrap.parentNode.removeChild(wrap);
  }, duration * 1000);
}

function onBunnyTap() {
  const bunny = $("bunny");
  if (bunny.classList.contains("tapped")) return;
  bunny.classList.add("tapped");
  $("bunnyBubble").classList.remove("show");
  if (bunnyMoveTimer) { clearInterval(bunnyMoveTimer); bunnyMoveTimer = null; }

  const rect = bunny.getBoundingClientRect();
  burstAt(rect.left + rect.width / 2, rect.top + rect.height / 2, 90);
  for (let i = 0; i < 7; i++) setTimeout(() => spawnBunnyHeart(bunny), i * 70);

  playMusic();
  startPhotoRain();
}

$("bunny").addEventListener("click", onBunnyTap);
$("bunny").addEventListener("keydown", (e) => {
  if (e.key === "Enter" || e.key === " ") { e.preventDefault(); onBunnyTap(); }
});

/* ============================================================
   Voice authentication
   ============================================================ */
const SpeechRec = window.SpeechRecognition || window.webkitSpeechRecognition;
let failedTries = 0;

function normalize(s) {
  return s.toLowerCase().replace(/[^\p{L}\p{N}\s]/gu, "").replace(/\s+/g, " ").trim();
}

function distance(a, b) {
  const d = Array.from({ length: a.length + 1 }, (_, i) => [i]);
  for (let j = 1; j <= b.length; j++) d[0][j] = j;
  for (let i = 1; i <= a.length; i++)
    for (let j = 1; j <= b.length; j++)
      d[i][j] = Math.min(d[i - 1][j] + 1, d[i][j - 1] + 1,
                         d[i - 1][j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1));
  return d[a.length][b.length];
}

function matchesPasscode(heard) {
  const said = normalize(heard);
  const code = normalize(CONFIG.passcode);
  if (!said) return false;
  if (said.includes(code)) return true;
  return 1 - distance(said, code) / Math.max(said.length, code.length) >= 0.8;
}

function unlock() {
  if (!$("modal").hidden) return;
  $("mic").disabled = true;
  $("authStatus").textContent = "Unlocked! 💖";
  $("modalText").textContent = "You said the magic words!";
  burst(100);
  $("modal").hidden = false;
  $("modalBtn").focus();
}

$("modalBtn").addEventListener("click", () => {
  $("modal").hidden = true;
  $("auth").hidden = true;
  burst(140);
  
  const music = $("bgMusic");
  if (music) {
    music.volume = 0;
    music.play().then(() => {
      music.pause();
      music.currentTime = 0;
    }).catch(() => { /* ignore if browser blocks it */ });
  }

  Tree.grow(() => {
    setTimeout(() => {
      $("letterCard").hidden = false;
      setTimeout(startLetter, 550);
      setTimeout(showBunny, 1600);
    }, 350);
  });
});

function wrongTry(heard) {
  failedTries++;
  $("heard").textContent = heard ? "I heard: “" + heard + "”" : "";
  $("authStatus").textContent = "Not quite. Try again.";
  $("mic").classList.add("wrong");
  setTimeout(() => $("mic").classList.remove("wrong"), 450);
  if (failedTries >= 3) $("clue").textContent = CONFIG.clue;
}

function check(heard) {
  matchesPasscode(heard) ? unlock() : wrongTry(heard);
}

$("typeToggle").addEventListener("click", () => { $("typeForm").hidden = false; $("typeInput").focus(); });
$("typeForm").addEventListener("submit", (e) => { e.preventDefault(); check($("typeInput").value); });

if (!SpeechRec) {
  $("mic").disabled = true;
  $("authStatus").textContent = "This browser can't listen. Use Chrome, Edge or Safari, or type the phrase.";
  $("typeForm").hidden = false;
} else {
  const rec = new SpeechRec();
  rec.lang = CONFIG.speechLang;
  rec.maxAlternatives = 5;
  rec.interimResults = false;
  let listening = false;

  rec.onstart = () => {
    listening = true;
    $("mic").classList.add("listening");
    $("authStatus").textContent = "Listening… say the phrase";
    $("heard").textContent = "";
  };
  rec.onend = () => { listening = false; $("mic").classList.remove("listening"); };
  rec.onerror = (e) => {
    if (e.error === "not-allowed" || e.error === "service-not-allowed") {
      $("authStatus").textContent = "Microphone is blocked. Allow it in your browser, or type the phrase.";
      $("typeForm").hidden = false;
    } else if (e.error === "no-speech") {
      $("authStatus").textContent = "I didn't hear anything. Tap the mic and try again.";
    } else {
      $("authStatus").textContent = "Something went wrong (" + e.error + "). Try again or type it.";
    }
  };
  rec.onresult = (e) => {
    const options = Array.from(e.results[0]).map((r) => r.transcript);
    const hit = options.find(matchesPasscode);
    check(hit || options[0]);
  };

  $("mic").addEventListener("click", () => {
    if (listening) { rec.stop(); return; }
    try { rec.start(); } catch (err) { /* already started */ }
  });
}
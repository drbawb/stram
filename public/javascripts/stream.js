// word is the bird
videojs.registerPlugin("qualityMenu", function(opts) {
  // destroy old menu

  // add the menu
  let menuButton = document.createElement("div");
  menuButton.classList.add("vjs-quality-menu");

  let label = document.createElement("span");
  label.innerHTML = "QUALITY";
  menuButton.appendChild(label);

  let menu = document.createElement("div");
  menu.classList.add("vjs-quality-menu-list"); 
  menuButton.appendChild(menu);

  menuButton.addEventListener("click", function(evt) {
    menu.classList.toggle("visible");
  });


  let vjsControls = this.el_.querySelector(".vjs-control-bar");
  let oldMenu     = vjsControls.querySelector(".vjs-quality-menu");

  if (oldMenu) { vjsControls.removeChild(oldMenu); }
  vjsControls.appendChild(menuButton);

  let foundLevels = [];
  let qualityLevels = this.qualityLevels();
  qualityLevels.on("addqualitylevel", function(evt) {
    console.log(evt);
    let level = evt.qualityLevel;
    foundLevels.push(level);
    
    let levelButton = document.createElement("div");
    levelButton.classList.add("vjs-quality-menu-level");
    levelButton.innerHTML = evt.qualityLevel.label; // TODO: friendly name
    menu.appendChild(levelButton);

    levelButton.addEventListener("click", function(evt) {
      level.enabled = true;

      for (var idx in foundLevels) {
        let entry = foundLevels[idx];
        if (entry !== level) { entry.enabled = false; }
      }
    });
  });
});


// hot new shit...
var config = {
  // stream info
  streamURI: "//seraphina.fatalsyntax.com:9001/hls",
  playlist:  "test",
  levels:    ["low", "mid", "src"],

  // no tricks, no gimmicks
  MIN_SEGMENTS: 3,
};

// /hls/test_mid/index.m3u8
var streamFound = false;
var searchForStream = function() {
  if (streamFound) { return; }

  // first check if the stream descriptor is available
  var req = new XMLHttpRequest();
  req.open("GET", `${config.streamURI}/${config.playlist}.m3u8`);
  req.addEventListener("load", function() {
    if (this.status !== 200) { console.warn("stream not avail: " + this.status); return; }
    streamFound = true;
    testStreamHealth();
  });
  req.send();


  setTimeout(searchForStream, 1000);
};

var streamHealth = []
var testStreamHealth = function() {
  // create ready flags
  for (let i = 0; i < config.levels.length; i++) { streamHealth[i] = false; waitForLevel(i); }
  proceedWhenReady();
};

var proceedWhenReady = function() {
  var allReady = true;
  for (let i = 0; i < streamHealth.length; i++) {
    if (!streamHealth[i]) { console.warn(`level ${config.levels[i]} not ready`); allReady = false; }
  }

  if (!allReady) { setTimeout(proceedWhenReady, 500); return; }
  console.log("here we go ...");

  let player = videojs('my-video');
  player.src({
    src: `${config.streamURI}/${config.playlist}.m3u8`,
    type: 'application/x-mpegURL',
    withCredentials: false
  });

  let qualityMenu = player.qualityMenu();
  player.play();
  installErrorTrap();
};

var waitForLevel = function(levelIdx) {
  let levelName = config.levels[levelIdx];
 
  // try to grab the playlist for this level
  var req = new XMLHttpRequest();
  req.open("GET", `${config.streamURI}/${config.playlist}_${levelName}/index.m3u8`);
  req.addEventListener("load", function() {
    if (this.status !== 200) { 
      setTimeout(waitForLevel(levelIdx), 1000); 
      return; 
    }

    // if we got a playlist, scan it for segments
    var numSegments = this.responseText.match(/\#EXTINF.*/g).length;
    if (numSegments < config.MIN_SEGMENTS) {
      setTimeout(waitForLevel(levelIdx), 250); 
      return;
    }

    // if we have at least 2 segments this level is healthy
    streamHealth[levelIdx] = true;
  });
  req.send();
};

var notReady = 0;
var installErrorTrap = function() {
  let player = videojs('my-video');
  let error  = player.error();
  let ready  = player.readyState();

  if (ready < 4) { notReady++; }
  if (ready === 4) { notReady = 0; }

  if (error || (notReady > 10)) {
    console.warn("not ready: " + notReady);
    console.warn(error);

    // reinit the player to get BRB screen
    player.src({
      src: `${config.streamURI}/${config.playlist}.m3u8`,
      type: 'application/x-mpegURL',
      withCredentials: false
    });

    // start looking for stream again
    notReady = 0;
    streamFound = false;
    searchForStream();

    return;
  }

  setTimeout(installErrorTrap, 1000);
};

searchForStream();

videojs('my-video').ready(function() {
  var myPlayer    = this;
  var aspectRatio = 9/16; // TODO: read from video?
  function resizeFrame() {
    var width = document.getElementById(myPlayer.id()).parentElement.offsetWidth;
    myPlayer.width(width);
    myPlayer.height(width * aspectRatio);
  }

  resizeFrame();
  window.onresize = resizeFrame;
});

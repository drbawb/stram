"use strict";

// hot new shit...
var config = {
  // stream info
  //streamURI: "//seraphina.fatalsyntax.com:9001/hls",
  //backupStreamURI: "//dcffedvtw5rxg.cloudfront.net/hls",
  streamURI: "//dcffedvtw5rxg.cloudfront.net/hls",
  backupStreamURI: "//seraphina.fatalsyntax.com:9001/hls",
  playlist: "cdn00",
  // playlist: "cdn00",
  levels: ["0", "1", "2"],
  friendly: ["High (4M)", "Medium (2M)", "Low (768k)"],

  // no tricks, no gimmicks
  MIN_SEGMENTS: 3,
  NOT_READY_SEC: 30,
  NOT_INDEX_SEC: 15,
};

videojs.registerPlugin("qualityMenu", function (opts) {
  // add the menu
  var menuButton = document.createElement("div");
  menuButton.classList.add("vjs-quality-menu");

  // label the button
  var label = document.createElement("span");
  label.innerHTML = "QUALITY";
  menuButton.appendChild(label);

  // add container for list options
  var menu = document.createElement("div");
  menu.classList.add("vjs-quality-menu-list");
  menuButton.appendChild(menu);

  // toggle visibility of the list
  menuButton.addEventListener("click", function (evt) {
    menu.classList.toggle("visible");
  });

  // add menu to vjs controls panel
  var vjsControls = this.el_.querySelector(".vjs-control-bar");
  var oldMenu = vjsControls.querySelector(".vjs-quality-menu");

  if (oldMenu) {
    vjsControls.removeChild(oldMenu);
  }
  vjsControls.appendChild(menuButton);

  // build mapping of friendly names
  var friendlyNames = {};
  for (var idx in config.levels) {
    var levelName = config.playlist + "_" + config.levels[idx] + "/index.m3u8";
    friendlyNames[levelName] = config.friendly[idx];
  }

  // handle quality level events
  var foundLevels = [];
  var qualityLevels = this.qualityLevels();
  qualityLevels.on("addqualitylevel", function (evt) {
    console.log(evt);
    var level = evt.qualityLevel;
    foundLevels.push(level);

    var levelButton = document.createElement("div");
    levelButton.classList.add("vjs-quality-menu-level");
    levelButton.innerHTML = friendlyNames[evt.qualityLevel.label];
    menu.appendChild(levelButton);

    levelButton.addEventListener("click", function (evt) {
      level.enabled = true;

      for (var idx in foundLevels) {
        var entry = foundLevels[idx];
        if (entry !== level) {
          entry.enabled = false;
        }
      }
    });
  });
});

var resetPlayer = function(id) {
  // get rid of old palyer
  videojs(id).dispose();

  // clone video tag for the new one
  var newPlayer = document.createElement("video");
  newPlayer.id = "my-video";
  newPlayer.classList.add("video-js");
  newPlayer.setAttribute("playsinline", null);
  newPlayer.setAttribute("controls", null);
  newPlayer.setAttribute("preload", "auto");
  newPlayer.setAttribute("poster", "/images/brb.png");
  newPlayer.dataset.setup = "{}";

  document.querySelector(".movie-box").appendChild(newPlayer);

  // reinit video aspect correction
  videojs('my-video').ready(function () {
    var myPlayer = this;
    var aspectRatio = 9 / 16; // TODO: read from video?
    function resizeFrame() {
      var width = document.getElementById(myPlayer.id()).parentElement.offsetWidth;
      myPlayer.width(width);
      myPlayer.height(width * aspectRatio);
    }

    resizeFrame();
    window.onresize = resizeFrame;
  });

  // init the source
  videojs(id).src({
    src: config.streamURI + "/" + config.playlist + ".m3u8",
    type: 'application/x-mpegURL',
    withCredentials: false
  });
}

// /hls/test_mid/index.m3u8
var streamFound = false;
var searchForStream = function searchForStream() {
  if (streamFound) {
    return;
  }

  // first check if the stream descriptor is available
  var req = new XMLHttpRequest();
  req.open("GET", config.streamURI + "/" + config.playlist + ".m3u8");
  req.addEventListener("load", function () {
    if (this.status !== 200) {
      console.warn("stream not avail: " + this.status);return;
    }
    streamFound = true;
    testStreamHealth();
  });
  req.send();

  setTimeout(searchForStream, 1000);
};

var streamHealth = [];
var testStreamHealth = function testStreamHealth() {
  // create ready flags
  for (var i = 0; i < config.levels.length; i++) {
    streamHealth[i] = false;
    waitForLevel(i);
  }
  proceedWhenReady();
};

var proceedWhenReady = function proceedWhenReady() {
  var allReady = true;
  for (var i = 0; i < streamHealth.length; i++) {
    if (!streamHealth[i]) {
      console.warn("level " + config.levels[i] + " not ready");allReady = false;
    }
  }

  if (!allReady) {
    setTimeout(proceedWhenReady, 500);return;
  }

  console.log("here we go ...");
  resetPlayer("my-video");

  var player = videojs("my-video");
  player.src({
    src: config.streamURI + "/" + config.playlist + ".m3u8",
    type: 'application/x-mpegURL',
    withCredentials: false
  });

  player.ready(function() {
    var quality = player.qualityMenu();
    installIndexTrap();
    installErrorTrap();
    player.play();
  });
};

var waitForLevel = function waitForLevel(levelIdx) {
  var levelName = config.levels[levelIdx];

  // try to grab the playlist for this level
  var req = new XMLHttpRequest();
  req.open("GET", config.streamURI + "/" + config.playlist + "_" + levelName + "/index.m3u8");
  req.addEventListener("load", function () {
    if (this.status !== 200) {
      console.warn("waiting, no playlist");
      setTimeout(function () {
        waitForLevel(levelIdx);
      }, 250);
      return;
    }

    // if we got a playlist, scan it for segments
    var numSegments = this.responseText.match(/\#EXTINF.*/g).length;
    if (numSegments < config.MIN_SEGMENTS) {
      console.warn("waiting, not enough segments");
      setTimeout(function () {
        waitForLevel(levelIdx);
      }, 1000);
      return;
    }

    // if we have at least 2 segments this level is healthy
    streamHealth[levelIdx] = true;
  });
  req.send();
};

var indexMissing = false;
var installIndexTrap = function() {
  // check if the stream index is missing
  var req = new XMLHttpRequest();
  req.open("GET", config.streamURI + "/" + config.playlist + ".m3u8");
  
  req.addEventListener("load", function () {
    indexMissing = (this.status !== 200);
    if (indexMissing) { console.warn("stream not avail: " + this.status); return; }
    setTimeout(installIndexTrap, 10000);
  });

  req.send();
};

var notIndex = 0;
var notReady = 0;
var installErrorTrap = function installErrorTrap() {
  var player = videojs('my-video');
  var error = player.error();
  var ready = player.readyState();

  // count seconds index is missing
  if (indexMissing) { notIndex++;   }
  else              { notIndex = 0; }

  // count seconds stream is unable to buffer
  if (ready < 4) { notReady++; }
  if (ready === 4) { notReady = 0; }

  if (error || (notIndex > config.NOT_INDEX_SEC) || (notReady > config.NOT_READY_SEC)) {
    console.warn(error);
    
    if (!indexMissing) {
      // when the index is present but we lost sync: switch to CDN
      console.warn("move to backup stream; not ready: " + notReady);
      config.streamURI = config.backupStreamURI;
    }
 
    // reinit the player to get BRB screen
    resetPlayer("my-video");

    // start looking for stream again
    // TODO: move these status flags into a struct
    notReady    = 0;
    notIndex    = 0;
    streamFound = false;
    searchForStream();

    return;
  }

  setTimeout(installErrorTrap, 1000);
};

resetPlayer("my-video");
searchForStream();

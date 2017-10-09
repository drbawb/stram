// hot new shit...
var config = {
  streamURI: "//seraphina.fatalsyntax.com:9001/hls",
  playlist:  "test",
  levels:    ["low", "mid", "src"],
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
  player.play();
  installErrorTrap();
};

var waitForLevel = function(levelIdx) {
  let levelName = config.levels[levelIdx];
  console.log("waiting for level: " + config.levels[levelIdx]);

  var req = new XMLHttpRequest();
  req.open("GET", `${config.streamURI}/${config.playlist}_${levelName}/index.m3u8`);
  req.addEventListener("load", function() {
    if (this.status !== 200) { 
      console.warn("level not avail"); 
      setTimeout(waitForLevel(levelIdx), 500); 
      return; 
    }

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

var myVideoPlayer = {
  checkInterval: 5, // seconds
  readyStateOneDuration: 0,
  readyStateTwoDuration: 0,

  healthCheck: function() {
    document.getElementById("alleluia-input").focus();

    var error = this.player.error();
    //console.log(error);
    if (error) {
      this.play();
      return;
    }

    var readyState = this.player.readyState();
    //console.log(readyState);
    switch(readyState) {
      case 0:
        this.play();
        return;
      case 1:
        this.readyStateOneDuration += this.checkInterval;
        break;
      case 2:
        this.readyStateTwoDuration += this.checkInterval;
        break;
      default:
        return;
    }
    //console.log(this.readyStateOneDuration);
    //console.log(this.readyStateTwoDuration);
    if (this.readyStateOneDuration >= 30
      || this.readyStateTwoDuration >= 30) {
      this.play();
      return;
    }
  },

  play: function() {
    this.readyStateOneDuration = 0;
    this.readyStateTwoDuration = 0;
    try {
      // console.log('destroying old player');
      // this.player.dispose();
      this.player = null;
    } catch (e) {}
    this.player = videojs('my-video');
    this.player.src({
      src: "//seraphina.fatalsyntax.com:9001/hls/test.m3u8",
      type: 'application/x-mpegURL',
      withCredentials: false
    });
    this.player.play();
  }
};
// myVideoPlayer.play();
// setInterval(function() {
//   myVideoPlayer.healthCheck();
// }, myVideoPlayer.checkInterval * 1000);

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

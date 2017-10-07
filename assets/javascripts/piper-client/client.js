console.log("starting text-mode client");
$(document).ready(function() {
	var client  = require('./chat/events.js'); // TODO: really, really bad module name.

  var funnyBusiness = ["47735570", "81500175"];
  var uidToTwitchId = {};

  var ui = {
    messages:  $("#alleluia-messages"),
    inputBox:  $("#alleluia-input"),
    submitBtn: $("#alleluia-submit"),
  };

  var emotes = {
    ":valeHype:":   {path: "/images/valemotes/hype2changes56.png"},
    ":valeLurk:": {path: "/images/valemotes/valeLurk56.png"},
    ":valeDabL:": {path: "/images/valemotes/dab 56.png"},
    ":valeDabR:": {path: "/images/valemotes/valeDabR56.png"}
  };

  var scanForEmotes = function(msg) {
    // output buffer
    var out  = ""; 
    var head = 0;

    // matcher
    var re = /:vale.*?:/g;
    var m;

    do { // pump matcher, substituting emotes
      m = re.exec(msg);
      if (m && emotes[m[0]]) {
        out += msg.substring(head, m.index);
        out += `<img class="emote" src="${emotes[m[0]].path}" alt="${m[0]}"/>`;
        head = m.index + m[0].length;
      }
    } while (m);

    // return modified buffer & any left over
    return out + msg.substring(head);
  };

  var appendMessage = function(type, name, msg) {
    var line = $("<div>")
      .addClass("alleluia-line")
      .addClass("alleluia-line-" + type);

    msg = scanForEmotes(msg);
    var name = $("<span>").addClass("alleluia-name").html(name);
    var msg  = $("<span>").addClass("alleluia-body").html(msg);

    name.appendTo(line);
    msg.appendTo(line);
    line.appendTo(ui.messages);

    ui.messages[0].scrollTop = ui.messages[0].scrollHeight;
  };

  // bootstrap client
  client.init();

  client.onDisconnect(function(uid) {
    console.log("disconnect caught...");
    console.log(uid);
  });

  client.onJoin(function(user) {
    console.log("join caught ...");
    appendMessage('sys', "System", `${user.name} has joined the chat.`);
  });

  client.onMessage(function(user, msg) {
    var twitchId = uidToTwitchId[user.uid];
    var style    = funnyBusiness.includes(twitchId) ? 'barcode' : 'default';
    appendMessage(style, user.name, msg);
  });

  // what happens when we receive a tag?
  client.onTag(function(tag) {
    switch (tag.key) {
      case "x-twitch-id":
        uidToTwitchId[tag.uid.fields[0]] = JSON.parse(tag.value);
        break;

      default:
        console.log('the bootstrap client understands NOTHING !!!');
    }
  });

  ui.submitBtn.on("click", function() {
    // grab the msg buffer
    var msg = ui.inputBox.val(); ui.inputBox.val("");
    console.log("sending: " + msg);
    client.sendMessage(msg);
  });
});


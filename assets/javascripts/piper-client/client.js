console.log("starting text-mode client");
$(document).ready(function() {
    var client  = require('./chat/events.js'); // TODO: really, really bad module name.

  var uidToTwitchId = {};

  var flair = {
    "mods":          { style: "mods",     members: ["76912664", "166713997"] },
    "hime":          { style: "hime",     members: ["47735570"]              },
    "vale":          { style: "vale",     members: ["27645199"]              },
    "juice":         { style: "juice",    members: ["100783701"]             },
    "z00z":          { style: "overlord", members: ["81500175"]              },
  };

  var flairForUser = function(id) {
    var style = 'default';
    for (var level in flair) {
      if (!flair.hasOwnProperty(level)) { continue; }
      if (flair[level].members.includes(id)) { 
        style = flair[level].style; break; 
      }
    }

    return style;
  };

  var ui = {
    // main container
    chatBox:  $(".chat-box"),
    movieBox: $(".movie-box"),
    
    // chat input
    messages:  $("#alleluia-messages"),
    inputBox:  $("#alleluia-input"),
    emoteBtn:  $("#alleluia-emotes"),
    emoteBox:  $("#alleluia-emote-menu")
  };

  var emotes = {
    ":valeBattle:":             {path: "/images/valemotes/valeBattle.png"},
    ":valeBlush:":              {path: "/images/valemotes/valeBlush.png"},
    ":valeCry:":                {path: "/images/valemotes/valeCry.png"},
    ":valeDabL:":               {path: "/images/valemotes/valeDabL.png"},
    ":valeDabR:":               {path: "/images/valemotes/valeDabR.png"},
    ":valeEdgy:":               {path: "/images/valemotes/valeEdgy.png"},
    ":valeFail:":               {path: "/images/valemotes/valeFail.png"},
    ":valeGasm:":               {path: "/images/valemotes/valeGasm.png"},
    ":valeGG:":                 {path: "/images/valemotes/valeGG.png"},
    ":valeGrrr:":               {path: "/images/valemotes/valeGrrr.png"},
    ":valeHug:":                {path: "/images/valemotes/valeHug.png"},
    ":valeHype:":               {path: "/images/valemotes/valeHype.png"},
    ":valeLove:":               {path: "/images/valemotes/valeLove.png"},
    ":valeLurk:":               {path: "/images/valemotes/valeLurk.png"},
    ":valeNano:":               {path: "/images/valemotes/valeNano.png"},
    ":valeowValeHealsGoodMan:": {path: "/images/valemotes/valeowValeHealsGoodMan.png"},
    ":valeRIP:":                {path: "/images/valemotes/valeRIP.png"},
    ":valeShrug:":              {path: "/images/valemotes/valeShrug.png"},
    ":valeSmug:":               {path: "/images/valemotes/valeSmug.png"},
    ":valeThink:":              {path: "/images/valemotes/valeThink.png"},
    ":valeWave:":               {path: "/images/valemotes/valeWave.png"},
    ":valeYo:":                 {path: "/images/valemotes/valeYo.png"}
  };

  var scanForEmotes = function(msg) {
    // output buffer
    var out  = ""; 
    var head = 0;

    // match :vale(emoteName): and substitute each one if it
    // w/ an image if it is a valid emote
    var m; var re = /:vale.*?:/g;
    do {
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

  var printUsers = function() {
    for (var key in userList) {
      appendMessage("sys", "System", userList[key]);
    }
  };

  // bootstrap client
  client.init();

  var userList = {};
  client.onDisconnect(function(uid) {
    console.log(`disconnect for: ${uid}`);
    appendMessage("sys", "Part", userList[uid]);
    delete userList[uid];
  });

  client.onJoin(function(user) {
    console.log("join caught ...");
    userList[user.uid] = user.name;
    appendMessage("sys", "Join", user.name);
  });

  client.onMessage(function(user, msg) {
    var twitchId = uidToTwitchId[user.uid];
    var style = flairForUser(twitchId);
    var name  = user.name;
    if (style === 'hime') { name = 'hime~'; }

    appendMessage(style, name, msg);
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

  // submit message when enter is pressed
  ui.inputBox.on("keyup", function(evt) {
    if (evt.keyCode === 13) { // press enter
      var msg = ui.inputBox.val(); ui.inputBox.val("");

      switch (msg) {
        case "/users":
          printUsers(); return;
      };

      console.log("sending: " + msg);
      client.sendMessage(msg);     
    };
  });

  // display emote menu
  ui.emoteBtn.on("click", function(evt) {
    ui.emoteBox.removeClass("hidden");
    evt.stopPropagation();
  });

  // hide emote menu if any negative space in chat is clicked
  ui.chatBox.on("click", function() {
    ui.emoteBox.addClass("hidden");
  });

  // hide emote menu on pc if escape is pressed
  ui.chatBox.on("keyup", function(evt) {
    if (evt.keyCode === 27) { // press escape
      ui.emoteBox.addClass("hidden");
    }
  });

  // populate the emote menu
  for (var key in emotes) {
    if (!emotes.hasOwnProperty(key)) { continue; }
    let shortCode = key;
    let imgUrl    = emotes[key].path;

    // set up a clickable icon
    let emoteEl   = $("<div>");
    let emoteIcon = $("<img>");
    emoteIcon.attr("src", imgUrl);
    emoteIcon.addClass("emote");
    emoteIcon.appendTo(emoteEl);
    emoteIcon.on("click", function(evt) {
      console.log("clicked on: " + shortCode);
      ui.inputBox.val(`${ui.inputBox.val()} ${shortCode}`);
      evt.stopPropagation();
    });

    emoteEl.appendTo(ui.emoteBox);
  }
});


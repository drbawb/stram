console.log("starting text-mode client");
$(document).ready(function() {
	var client  = require('./chat/events.js'); // TODO: really, really bad module name.

  var ui = {
    messages:  $("#alleluia-messages"),
    inputBox:  $("#alleluia-input"),
    submitBtn: $("#alleluia-submit"),
  };

  var appendMessage = function(type, msg) {
    var message = $("<div>")
      .addClass("alleluia-line")
      .addClass("alleluia-line-" + type);

    message.html(msg);
    message.appendTo(ui.messages);

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
    appendMessage('sys', `${user.name} has joined the chat.`);
  });

  client.onMessage(function(user, msg) {
    appendMessage('default', `<strong>${user.name}</strong>: ${msg}`);
  });

  // what happens when we receive a tag?
  client.onTag(function(tag) {
    switch (tag.key) {
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


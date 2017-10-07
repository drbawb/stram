console.log("starting text-mode client");
$(document).ready(function() {
	var client  = require('./chat/events.js'); // TODO: really, really bad module name.

	// ask for permission to display thinguses. es.
	var _userPoses  = [];
	var _canDisplay = false;

	if (typeof Notification !== 'undefined') {
		if (Notification.permission === 'default') {
			Notification.requestPermission( function(status) {
				if (status === 'granted') { _canDisplay = true; }
			});
		} else if (Notification.permission === 'granted') {
			_canDisplay = true;
		}
	}

  var ui = {
    messages:  $("#alleluia-messages"),
    inputBox:  $("#alleluia-input"),
    submitBtn: $("#alleluia-submit"),
  };

  // bootstrap client
  client.init();

  client.onDisconnect(function(uid) {
    console.log("disconnect caught...");
    console.log(uid);
  });

  client.onJoin(function(room) {
    console.log("join caught ...");
    var users = room.getUsers();

    for (var idx in users) {
      console.log("-- processing user...");
      console.log(users[idx]);
      console.log("-- done w/ user ....");
    }
  });

  client.onMessage(function(user, msg) {
    if (_canDisplay && !document.hasFocus()) {
      var title = user.name + " said:";
      var n = new Notification(title, {body: msg});
      n.onshow = function() {
        setTimeout(function() {
          n.close();
        }, 5000);
      };
    }

    var message = $("<div>").addClass("alleluia-line-other");
    message.html(`${user.name}: ${msg}`);
    message.appendTo(ui.messages);
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


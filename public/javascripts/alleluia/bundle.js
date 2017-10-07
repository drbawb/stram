/**
 *
 * Piper - the javascript `nirvash protocol` 2D chat client.
 * Proud member of the Serenity Isles `Project Phoenix` family of software.
 *
 * Copyright (c) 2014, Robbie Straw <drbawb@fatalsyntax.com>
 * All rights reserved.
 *
 * This is proprietary software. Redistribution is not permitted under any
 * circumstances without express written permission from the copyright holder(s).
 *
 * THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS" AND 
 * ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED 
 * WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE DISCLAIMED. 
 * 
 * IN NO EVENT SHALL THE COPYRIGHT HOLDER OR CONTRIBUTORS BE LIABLE FOR ANY DIRECT,
 * INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, 
 * BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, 
 * DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY 
 * OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING 
 * NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE, 
 * EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
 *
 */

(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);throw new Error("Cannot find module '"+o+"'")}var f=n[o]={exports:{}};t[o][0].call(f.exports,function(e){var n=t[o][1][e];return s(n?n:e)},f,f.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
var Session = require('./session.js');

module.exports.init = function() {
	console.log("starting up");
	Session.init();
};

module.exports.onDisconnect = Session.onDisconnect;
module.exports.onJoin       = Session.onJoin;
module.exports.onMessage    = Session.onMessage;
module.exports.onTag        = Session.onTag;
module.exports.isOwnID      = Session.isOwnID;
module.exports.tagSelf      = Session.tagSelf;
module.exports.sendMessage  = Session.sendMessage;

},{"./session.js":3}],2:[function(require,module,exports){
/**
 * Nirvash is a library that constructs `piper` compatible requests
 * and serializes them for wire transport.
 */
module.exports = (function() {
	var me = {};

	/**
	 * Registers a user w/ the nirvash server; performing NO AUTHENTICATION.
	 */
	me.registerUser = function(username) {
		var uri    = '/self/registration';
		var method = { variant: "Put", fields: [] };
		var val    = { name: username }; // struct RUser { name:string }

		return { variant: "Resource", fields: [method, uri, JSON.stringify(val)] };
	};

	/**
	 * Addresses a message to be broadcast to an entire room
	 */
	me.targetRoom = function(room_name) {
		return { variant: "RoomByName", fields: [room_name] };
	};

	/**
	 * Tags a user with a given key-value pair.
	 * [destination:Target, key: String, tag:String]
	 */
	me.tagUser = function(uid, room_name, key, val) {
		// /rooms/{name}/{uid}/tag/{key}/{val}
		var uri = '/rooms/' + room_name + '/' + uid + '/tag/' + key;
		var method = { variant: "Publish", fields: [] };

		return { variant: "Resource", fields: [method, uri, JSON.stringify(val)] };
	};

	/**
	 * Sends a message to the room.
	 *
	 * The username is required; however it is ignored by the server for outgoing
	 * messages.
	 */
	me.chatMessage = function(room_name, username, message) {
		var uri = '/rooms/' + room_name + '/messages';
		var method = { variant: "Publish", fields: [] };

		return { variant: "Resource", fields: [method, uri, message] };
	};

	return me;
}());


},{}],3:[function(require,module,exports){
var Nirvash    = require('./nirvash.js');

/**
 * Alleluia - Javascript Piper Client
 */
module.exports = (function() {
	var me = {};

	// private state
	var ws        = null;
	var uri       = "ws://metallia.fatalsyntax.com:4290";
	var connected = false;
	var uid       = "";
	var username  = "";
	var roomname  = "";

	// event listeners
	var disconnectEmitter;
	var joinRoomEmitter;
	var messageEmitter;
	var roomTagEmitter;

	// public interface
	me.init = function() {
    console.log("starting client ...");

    // connects to that server, joins room on success...
		connectServer(function() { joinRoom(); });
	};

	// returns true if logged in user matches provided uid
	me.isOwnID = function(otherUid) {
		return uid === otherUid;
	};

	// tripped when a user disconnects
	me.onDisconnect = function(dcResponder) {
		disconnectEmitter = dcResponder;
	};

	// tripped when room is joined
	me.onJoin = function(joinResponder) {
		joinRoomEmitter = joinResponder;
	};

	// tripped when any user says something
	me.onMessage = function(msgResponder) {
		messageEmitter = msgResponder;
	};

	// triped when user is tagged in current room
	me.onTag = function(tagResponder) {
		roomTagEmitter = tagResponder;
	};

  me.sendMessage = function(msg) {
    // handle chat message
    ws.send(JSON.stringify(Nirvash.chatMessage(
          roomname,
          username,
          msg)));
  };

	// private functions
	function emitDisconnect(uid) {
		if (typeof disconnectEmitter !== "undefined") {
			disconnectEmitter(uid);
		}
	}

	function emitJoin(user) {
		if (typeof joinRoomEmitter !== "undefined") {
			joinRoomEmitter(user);
		}
	}

	function emitMessage(user, msg) {
		if (typeof messageEmitter !== "undefined") {
			messageEmitter(user, msg);
		}
	}

	function emitTag(tagObj) {
		if (typeof roomTagEmitter !== "undefined") {
			roomTagEmitter(tagObj);
		}
	}

	function getUsername() {
		return username;
	}
	
	function toggleConnectState() {
		connected = !connected;
	}

	function connectServer(cb) {
		if (connected) {
			console.log("you're already connected");
      return;
    }

    console.log("connecting to kyrie @ " + uri);

    // test success and disable connection chrome
    ws = new WebSocket(uri);
    toggleConnectState();

    // handle connection errors
    ws.onerror = function(evt) {
      console.error(evt);
    };

    // bind message handler
    ws.onmessage = function(evt) {
      var message = JSON.parse(evt.data);
      var body, destination, notice;

      if (message.variant === "TagUser") {
        var tagApi = {
          uid:   message.fields[0], // target
          key:   message.fields[1],
          value: message.fields[2]
        };

        emitTag(tagApi);
      } else if (message.variant === "Notice") {
        body        = message.fields[2]; // string
        destination = message.fields[0]; // Target
        var from    = message.fields[1]; // NameTag (optional)

        // FIXME: if this is the `welcome` message - steal our uuid from it.
        // ideally `register` would actually generate a reply w/ our assigned ID.
        if (from === null && 
          destination.variant == "UserById" && 
          body.indexOf('welcome') === 0) {

          uid = destination.fields[0];

          cb();
        }
      } else if (message.variant == "Join") {
        var user = message.fields[0];
        roomname = message.fields[1];

        // inform listeners that you have joined a new channel
        emitJoin(user);

        notice = user.name + " has joined #" + roomname + ".";
        console.warn(notice);
      } else if (message.variant == "Disconnect") {
        var userId   = message.fields[0][0];
        var username = message.fields[0][1];
        var reason   = message.fields[1];
        notice       = username + " has disconnected: " + reason + ".";

        emitDisconnect(userId);
        
        console.warn(notice);
      } else if (message.variant === "ChatMessage") {
        // field[0] => destination (Target)
        // field[1] => name        ([uid,string])
        // field[2] => body        (string)

        body = message.fields[2];
        var from_user = {
          uid:  message.fields[1][0],
          name: message.fields[1][1]
        };

        console.log("got message: " + body);
        emitMessage(from_user, body);
      }
    };

    // register user
    ws.onopen = function() {
      username = "drbawb";

      var cmd = Nirvash.registerUser(username);
      ws.send(JSON.stringify(cmd));
    };
	}

	function joinRoom() {
		var room = "movienight";
		var path = '/rooms/' + room;
		var method = { variant: "Subscribe", fields: [] };
		var uri    = { variant: "Resource", fields: [method, path, null] };

		ws.send(JSON.stringify(uri));
	}

	return me;
}());


},{"./nirvash.js":2}],4:[function(require,module,exports){
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


},{"./chat/events.js":1}]},{},[4])
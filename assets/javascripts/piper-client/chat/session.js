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
			console.log("emitting own join...");
			var roomApi = {};
			var users   = [user];
			
			roomApi.getUsers = function() {
				return users;
			};

			joinRoomEmitter(roomApi);
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


var Nirvash    = require('./nirvash.js');

/**
 * Alleluia - Javascript Piper Client
 */
module.exports = (function() {
	var me = {};

	// private state
	var ws        = null;
	var uri       = "wss://valestream.fatalsyntax.com/kyrie";
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
		connectServer(function() { 
      joinRoom();    // join movie night
      tagTwitchId(); // z00z made me do it
    });
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
    if (msg === "") { console.warn("cowardly refusing to send blank message"); return; }
    // handle chat message
    ws.send(JSON.stringify(Nirvash.chatMessage(
          roomname,
          username,
          msg)));
  };

  me.sendTag = function(key, val) {
    ws.send(JSON.stringify(Nirvash.tagUser(
      uid,
      roomname,
      key,
      val)));
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

      if (typeof(message["TagUser"]) !== "undefined") {
        message = message["TagUser"];
        var tagApi = {
          uid:   message.destination, // Target
          key:   message.key,         // string
          value: message.tag          // string
        };

        emitTag(tagApi);
      } else if (typeof(message["Notice"]) !== "undefined") {
        message = message["Notice"];
        body        = message.payload; // string
        destination = message.destination;
        var from    = message.from; // NameTag (optional)

        // FIXME: if this is the `welcome` message - steal our uuid from it.
        // ideally `register` would actually generate a reply w/ our assigned ID.
        if (from === null && 
          typeof(destination["UserById"]) !== null &&
          body.indexOf('welcome') === 0) {

          uid = destination.uid;

          cb();
        }
      } else if (typeof(message["Join"]) !== "undefined") {
        message = message["Join"];
        var user = message.uid;
        roomname = message.channel;

        for (var tag in user.tags) {
          if (!user.tags.hasOwnProperty(tag)) { continue; }

          // HACK: uid probably should be a parsed target
          //       but apparently the real API doesn't pull it out
          //       RIP ...
          emitTag({
            uid:   { fields: [user.uid] },
            key:   tag,
            value: user.tags[tag]
          });
        }

        // inform listeners that you have joined a new channel
        emitJoin(user);

        notice = user.name + " has joined #" + roomname + ".";
        console.warn(notice);
      } else if (typeof(message["Disconnect"]) !== "undefined") {
        message = message["Disconnect"]
        var userId   = message.uid[0];
        var username = message.uid[1];
        var reason   = message.reason;
        notice       = username + " has disconnected: " + reason + ".";

        emitDisconnect(userId);
        
        console.warn(notice);
      } else if (typeof(message["ChatMessage"]) !== "undefined") {
        message = message["ChatMessage"];
        // field[0] => destination (Target)
        // field[1] => name        ([uid,string])
        // field[2] => body        (string)

        body = message.payload;
        var from_user = {
          uid:  message.from[0],
          name: message.from[1]
        };

        console.log("got message: " + body);
        emitMessage(from_user, body);
      }
    };

    // register user
    ws.onopen = function() {
      username = $("#alleluia-connect-name").val();
      var cmd = Nirvash.registerUser(username);
      ws.send(JSON.stringify(cmd));
    };
	}

	function joinRoom() {
		roomname = "movienight";
		var path = '/rooms/' + roomname;
		var method = "Subscribe";
		var uri    = {Resource: { method: method, path: path, payload: null } };

		ws.send(JSON.stringify(uri));
	}

  function tagTwitchId() {
    me.sendTag("x-twitch-id", $("#alleluia-connect-id").val());
  }

	return me;
}());


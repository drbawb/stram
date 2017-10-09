"use strict";

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

(function e(t, n, r) {
  function s(o, u) {
    if (!n[o]) {
      if (!t[o]) {
        var a = typeof require == "function" && require;if (!u && a) return a(o, !0);if (i) return i(o, !0);throw new Error("Cannot find module '" + o + "'");
      }var f = n[o] = { exports: {} };t[o][0].call(f.exports, function (e) {
        var n = t[o][1][e];return s(n ? n : e);
      }, f, f.exports, e, t, n, r);
    }return n[o].exports;
  }var i = typeof require == "function" && require;for (var o = 0; o < r.length; o++) {
    s(r[o]);
  }return s;
})({ 1: [function (require, module, exports) {
    var Session = require('./session.js');

    module.exports.init = function () {
      console.log("starting up");
      Session.init();
    };

    module.exports.onDisconnect = Session.onDisconnect;
    module.exports.onJoin = Session.onJoin;
    module.exports.onMessage = Session.onMessage;
    module.exports.onTag = Session.onTag;
    module.exports.isOwnID = Session.isOwnID;
    module.exports.sendMessage = Session.sendMessage;
    module.exports.sendTag = Session.sendTag;
  }, { "./session.js": 3 }], 2: [function (require, module, exports) {
    /**
     * Nirvash is a library that constructs `piper` compatible requests
     * and serializes them for wire transport.
     */
    module.exports = function () {
      var me = {};

      /**
       * Registers a user w/ the nirvash server; performing NO AUTHENTICATION.
       */
      me.registerUser = function (username) {
        var uri = '/self/registration';
        var method = { variant: "Put", fields: [] };
        var val = { name: username }; // struct RUser { name:string }

        return { variant: "Resource", fields: [method, uri, JSON.stringify(val)] };
      };

      /**
       * Addresses a message to be broadcast to an entire room
       */
      me.targetRoom = function (room_name) {
        return { variant: "RoomByName", fields: [room_name] };
      };

      /**
       * Tags a user with a given key-value pair.
       * [destination:Target, key: String, tag:String]
       */
      me.tagUser = function (uid, room_name, key, val) {
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
      me.chatMessage = function (room_name, username, message) {
        var uri = '/rooms/' + room_name + '/messages';
        var method = { variant: "Publish", fields: [] };

        return { variant: "Resource", fields: [method, uri, message] };
      };

      return me;
    }();
  }, {}], 3: [function (require, module, exports) {
    var Nirvash = require('./nirvash.js');

    /**
     * Alleluia - Javascript Piper Client
     */
    module.exports = function () {
      var me = {};

      // private state
      var ws = null;
      var uri = "ws://metallia.fatalsyntax.com:4290";
      var connected = false;
      var uid = "";
      var username = "";
      var roomname = "";

      // event listeners
      var disconnectEmitter;
      var joinRoomEmitter;
      var messageEmitter;
      var roomTagEmitter;

      // public interface
      me.init = function () {
        console.log("starting client ...");

        // connects to that server, joins room on success...
        connectServer(function () {
          joinRoom(); // join movie night
          tagTwitchId(); // z00z made me do it
        });
      };

      // returns true if logged in user matches provided uid
      me.isOwnID = function (otherUid) {
        return uid === otherUid;
      };

      // tripped when a user disconnects
      me.onDisconnect = function (dcResponder) {
        disconnectEmitter = dcResponder;
      };

      // tripped when room is joined
      me.onJoin = function (joinResponder) {
        joinRoomEmitter = joinResponder;
      };

      // tripped when any user says something
      me.onMessage = function (msgResponder) {
        messageEmitter = msgResponder;
      };

      // triped when user is tagged in current room
      me.onTag = function (tagResponder) {
        roomTagEmitter = tagResponder;
      };

      me.sendMessage = function (msg) {
        // handle chat message
        ws.send(JSON.stringify(Nirvash.chatMessage(roomname, username, msg)));
      };

      me.sendTag = function (key, val) {
        ws.send(JSON.stringify(Nirvash.tagUser(uid, roomname, key, val)));
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
        ws.onerror = function (evt) {
          console.error(evt);
        };

        // bind message handler
        ws.onmessage = function (evt) {
          var message = JSON.parse(evt.data);
          var body, destination, notice;

          if (message.variant === "TagUser") {
            var tagApi = {
              uid: message.fields[0], // target
              key: message.fields[1],
              value: message.fields[2]
            };

            emitTag(tagApi);
          } else if (message.variant === "Notice") {
            body = message.fields[2]; // string
            destination = message.fields[0]; // Target
            var from = message.fields[1]; // NameTag (optional)

            // FIXME: if this is the `welcome` message - steal our uuid from it.
            // ideally `register` would actually generate a reply w/ our assigned ID.
            if (from === null && destination.variant == "UserById" && body.indexOf('welcome') === 0) {

              uid = destination.fields[0];

              cb();
            }
          } else if (message.variant == "Join") {
            var user = message.fields[0];
            roomname = message.fields[1];

            for (var tag in user.tags) {
              if (!user.tags.hasOwnProperty(tag)) {
                continue;
              }

              // HACK: uid probably should be a parsed target
              //       but apparently the real API doesn't pull it out
              //       RIP ...
              emitTag({
                uid: { fields: [user.uid] },
                key: tag,
                value: user.tags[tag]
              });
            }

            // inform listeners that you have joined a new channel
            emitJoin(user);

            notice = user.name + " has joined #" + roomname + ".";
            console.warn(notice);
          } else if (message.variant == "Disconnect") {
            var userId = message.fields[0][0];
            var username = message.fields[0][1];
            var reason = message.fields[1];
            notice = username + " has disconnected: " + reason + ".";

            emitDisconnect(userId);

            console.warn(notice);
          } else if (message.variant === "ChatMessage") {
            // field[0] => destination (Target)
            // field[1] => name        ([uid,string])
            // field[2] => body        (string)

            body = message.fields[2];
            var from_user = {
              uid: message.fields[1][0],
              name: message.fields[1][1]
            };

            console.log("got message: " + body);
            emitMessage(from_user, body);
          }
        };

        // register user
        ws.onopen = function () {
          username = $("#alleluia-connect-name").val();
          var cmd = Nirvash.registerUser(username);
          ws.send(JSON.stringify(cmd));
        };
      }

      function joinRoom() {
        roomname = "movienight";
        var path = '/rooms/' + roomname;
        var method = { variant: "Subscribe", fields: [] };
        var uri = { variant: "Resource", fields: [method, path, null] };

        ws.send(JSON.stringify(uri));
      }

      function tagTwitchId() {
        me.sendTag("x-twitch-id", $("#alleluia-connect-id").val());
      }

      return me;
    }();
  }, { "./nirvash.js": 2 }], 4: [function (require, module, exports) {
    console.log("starting text-mode client");
    $(document).ready(function () {
      var client = require('./chat/events.js'); // TODO: really, really bad module name.

      var uidToTwitchId = {};

      var flair = {
        "mods": { style: "mods", members: ["76912664", "166713997"] },
        "hime": { style: "hime", members: ["47735570"] },
        "vale": { style: "vale", members: ["27645199"] },
        "juice": { style: "juice", members: ["100783701"] },
        "z00z": { style: "overlord", members: ["81500175"] }
      };

      var flairForUser = function flairForUser(id) {
        var style = 'default';
        for (var level in flair) {
          if (!flair.hasOwnProperty(level)) {
            continue;
          }
          if (flair[level].members.includes(id)) {
            style = flair[level].style;break;
          }
        }

        return style;
      };

      var ui = {
        // main container
        chatBox: $(".chat-box"),
        movieBox: $(".movie-box"),

        // chat input
        stale: $("#alleluia-stale"),
        messages: $("#alleluia-messages"),
        inputBox: $("#alleluia-input"),
        emoteBtn: $("#alleluia-emotes"),
        emoteBox: $("#alleluia-emote-menu")
      };

      var emotes = {
        ":valeBattle:": { path: "/images/valemotes/valeBattle.png" },
        ":valeBlush:": { path: "/images/valemotes/valeBlush.png" },
        ":valeCry:": { path: "/images/valemotes/valeCry.png" },
        ":valeDabL:": { path: "/images/valemotes/valeDabL.png" },
        ":valeDabR:": { path: "/images/valemotes/valeDabR.png" },
        ":valeEdgy:": { path: "/images/valemotes/valeEdgy.png" },
        ":valeFail:": { path: "/images/valemotes/valeFail.png" },
        ":valeGasm:": { path: "/images/valemotes/valeGasm.png" },
        ":valeGG:": { path: "/images/valemotes/valeGG.png" },
        ":valeGrrr:": { path: "/images/valemotes/valeGrrr.png" },
        ":valeHug:": { path: "/images/valemotes/valeHug.png" },
        ":valeHype:": { path: "/images/valemotes/valeHype.png" },
        ":valeLove:": { path: "/images/valemotes/valeLove.png" },
        ":valeLurk:": { path: "/images/valemotes/valeLurk.png" },
        ":valeNano:": { path: "/images/valemotes/valeNano.png" },
        ":valeowValeHealsGoodMan:": { path: "/images/valemotes/valeowValeHealsGoodMan.png" },
        ":valeRIP:": { path: "/images/valemotes/valeRIP.png" },
        ":valeShrug:": { path: "/images/valemotes/valeShrug.png" },
        ":valeSmug:": { path: "/images/valemotes/valeSmug.png" },
        ":valeThink:": { path: "/images/valemotes/valeThink.png" },
        ":valeWave:": { path: "/images/valemotes/valeWave.png" },
        ":valeYo:": { path: "/images/valemotes/valeYo.png" }
      };

      var scanForEmotes = function scanForEmotes(msg) {
        // output buffer
        var out = "";
        var head = 0;

        // match :vale(emoteName): and substitute each one if it
        // w/ an image if it is a valid emote
        var m;var re = /:vale.*?:/g;
        do {
          m = re.exec(msg);
          if (m && emotes[m[0]]) {
            out += msg.substring(head, m.index);
            out += "<img class=\"emote\" src=\"" + emotes[m[0]].path + "\" alt=\"" + m[0] + "\"/>";
            head = m.index + m[0].length;
          }
        } while (m);

        // return modified buffer & any left over
        return out + msg.substring(head);
      };

      var appendMessage = function appendMessage(type, name, msg) {
        var line = $("<div>").addClass("alleluia-line").addClass("alleluia-line-" + type);

        msg = scanForEmotes(msg);
        var name = $("<span>").addClass("alleluia-name").html(name);
        var msg = $("<span>").addClass("alleluia-body").html(msg);

        name.appendTo(line);
        msg.appendTo(line);
        line.appendTo(ui.messages);

        scrollIfNecessary(line);
      };

      var printUsers = function printUsers() {
        for (var key in userList) {
          appendMessage("sys", "System", userList[key]);
        }
      };

      var scrollIfNecessary = function scrollIfNecessary(el) {
        var maxScrollHeight = ui.messages[0].scrollHeight - ui.messages[0].clientHeight;
        if (ui.messages[0].scrollTop < maxScrollHeight - el[0].clientHeight) {
          ui.stale.removeClass("hidden");
          return;
        }

        ui.stale.addClass("hidden");
        el[0].scrollIntoView();
      };

      // bootstrap client
      client.init();

      var userList = {};
      client.onDisconnect(function (uid) {
        console.log("disconnect for: " + uid);
        appendMessage("sys", "Part", userList[uid]);
        delete userList[uid];
      });

      client.onJoin(function (user) {
        console.log("join caught ...");
        userList[user.uid] = user.name;
        appendMessage("sys", "Join", user.name);
      });

      client.onMessage(function (user, msg) {
        var twitchId = uidToTwitchId[user.uid];
        var style = flairForUser(twitchId);
        var name = user.name;
        if (style === 'hime') {
          name = 'hime~';
        }

        appendMessage(style, name, msg);
      });

      // what happens when we receive a tag?
      client.onTag(function (tag) {
        switch (tag.key) {
          case "x-twitch-id":
            uidToTwitchId[tag.uid.fields[0]] = JSON.parse(tag.value);
            break;

          default:
            console.log('the bootstrap client understands NOTHING !!!');
        }
      });

      // submit message when enter is pressed
      ui.inputBox.on("keyup", function (evt) {
        if (evt.keyCode === 13) {
          // press enter
          var msg = ui.inputBox.val();ui.inputBox.val("");

          switch (msg) {
            case "/users":
              printUsers();return;
          };

          console.log("sending: " + msg);
          client.sendMessage(msg);
        };
      });

      // display emote menu
      ui.emoteBtn.on("click", function (evt) {
        ui.emoteBox.removeClass("hidden");
        evt.stopPropagation();
      });

      // hide emote menu if any negative space in chat is clicked
      ui.chatBox.on("click", function () {
        ui.emoteBox.addClass("hidden");
      });

      // hide emote menu on pc if escape is pressed
      ui.chatBox.on("keyup", function (evt) {
        if (evt.keyCode === 27) {
          // press escape
          ui.emoteBox.addClass("hidden");
        }
      });

      ui.messages.on("scroll", function (evt) {
        var maxScrollHeight = ui.messages[0].scrollHeight - ui.messages[0].clientHeight;
        if (ui.messages[0].scrollTop >= maxScrollHeight) {
          ui.stale.addClass("hidden");
        }
      });

      // populate the emote menu

      var _loop = function _loop() {
        if (!emotes.hasOwnProperty(key)) {
          return "continue";
        }
        var shortCode = key;
        var imgUrl = emotes[key].path;

        // set up a clickable icon
        var emoteEl = $("<div>");
        var emoteIcon = $("<img>");
        emoteIcon.attr("src", imgUrl);
        emoteIcon.addClass("emote");
        emoteIcon.appendTo(emoteEl);
        emoteIcon.on("click", function (evt) {
          console.log("clicked on: " + shortCode);
          ui.inputBox.val(ui.inputBox.val() + " " + shortCode);
          evt.stopPropagation();
        });

        emoteEl.appendTo(ui.emoteBox);
      };

      for (var key in emotes) {
        var _ret = _loop();

        if (_ret === "continue") continue;
      }
    });
  }, { "./chat/events.js": 1 }] }, {}, [4]);
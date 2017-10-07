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
module.exports.sendMessage  = Session.sendMessage;
module.exports.sendTag      = Session.sendTag;

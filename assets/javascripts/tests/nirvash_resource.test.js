var client = require('../piper-client/chat/nirvash.js');

describe("nirvash PUTs registration", function() {
	var username = "anon";
	var resource = client.registerUser(username);
	var method   = resource.fields[0];

	it("should be a Resource#Put", function() {
		expect(resource.variant).toBe("Resource");
		expect(method.variant).toBe("Put");
	});

	it ("should go to /self/registration", function() {
		expect(resource.fields[1]).toBe("/self/registration");
	});
});

describe("nirvash tags user with JSON data", function() {
	var uid  = "12345";
	var room = "dotmod";
	var key  = "position";
	var data = [42,0];

	var tag    = client.tagUser(uid, room, key, data);
	var method = tag.fields[0];
	var uri    = tag.fields[1];
	var pl     = tag.fields[2];

	it("should be a Resource#Publish", function() {
		expect(tag.variant).toBe("Resource");
		expect(method.variant).toBe("Publish");
	});

	it("should have a JSON payload matching original data", function() {
		expect(JSON.parse(pl)[0]).toBe(data[0]);
	});

	it("should have the key embedded in the uri", function() {
		expect(uri).toContain(key);
	});

});

describe("nirvash should publish messages to named streams", function() {
	var room    = "dotmod";
	var user    = "anon";
	var message = ".......";

	var outgoing = client.chatMessage(room, user, message);
	var method   = outgoing.fields[0];
	var uri      = outgoing.fields[1];
	var pl       = outgoing.fields[2];

	it("should be a Resource#Publish", function() {
		expect(outgoing.variant).toBe("Resource");
		expect(method.variant).toBe("Publish");
	});

	it("should have the destination in the URI", function() {
		expect(uri).toContain(room);
	});

	it("should encode the message as a bare string", function() {
		expect(pl).toBe(message);
	});
});


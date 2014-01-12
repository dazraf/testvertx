var vertx = require('vertx');
var container = require('vertx/container');
var http = require('vertx/http');
var log = container.logger;
var bus = vertx.eventBus;

var server = http.createHttpServer();
var topic = "fxservice.change";

server.websocketHandler(function(websocket) {
	if (websocket.path() === '/services/event') {
		var listener = new FXClient(websocket);
		var busCallback = function (data) {
		  listener.publish(data);
	    }
		bus.registerHandler(topic, busCallback);

		websocket.closeHandler(function () {
			bus.unregisterHandler(topic, busCallback);
			log.info("websocket closed.")
		});
		log.info("websocket setup.")
	} else {
		log.warning("Rejecting connection for " + websocket.path())
		websocket.reject();
	}        
})
.listen(8081, 'localhost');

function FXClient(socket) {
	this.socket = socket;
}

FXClient.prototype = {
	publish : function(data) {
		this.socket.writeTextFrame(JSON.stringify(data));
	}
}


var vertx = require('vertx');
var container = require('vertx/container');
var http = require('vertx/http');
var log = container.logger;
var bus = vertx.eventBus;

var requestTopic = "fxservice.request";

var routeMatcher = new http.RouteMatcher();

routeMatcher.get('/', function(req) {
	log.info("redirect / to index.html");
	req.response.statusCode(302).headers().set("Location", "/static/index.html");
	req.response.end();
});

routeMatcher.get('/favicon.ico', function(req) {
	req.response.sendFile('static/img/favicon.ico');
});

routeMatcher.get('/fx/', function(req) {
	bus.send(requestTopic, null, function(data) {
		req.response.headers('Content-Type', 'application/json');
		req.response.end(data);
	})
});

routeMatcher.getWithRegEx('^\/static\/(.*)', function (req) {
	var file = req.params().get('param0');
	//log.info("sending " + file + " for general static request")
	req.response.sendFile('static/' + file);	
});

var server = http.createHttpServer();
server.requestHandler(routeMatcher).listen(8080, 'localhost');


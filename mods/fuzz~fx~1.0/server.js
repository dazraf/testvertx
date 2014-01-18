var vertx = require('vertx');
var container = require('vertx/container');
var http = require('vertx/http');
var log = container.logger;
var bus = vertx.eventBus;
load('messages.js');
var changeTopic = messages.fxservice.changeTopic;
var requestTopic = messages.fxservice.requestTopic;

var wsPort = 8081;

var liveRates = {
	'eurusd.spot': {pair: 'eurusd', tenor: 'spot', value: 1.3791, ts: Date.now()},
	'eurusd.1w': {pair: 'eurusd', tenor: '1w', value: 1.22, ts: Date.now()},
	'eurgbp.spot': {pair: 'eurgbp', tenor: 'spot', value: 0.8341, ts: Date.now()},
	'eurgbp.1w': {pair: 'eurgbp', tenor: '1w', value: 8.9, ts: Date.now()}
};

var names = Object.getOwnPropertyNames(liveRates);



// evolve and publish every second
var timerIdSpot = vertx.setPeriodic(1000, function (timerId) {
	var message = evolveRates();
	if (message != null) 
		bus.publish(changeTopic, message);
})

bus.registerHandler(requestTopic, fxrequestHandler, function() {
	log.info(requestTopic + " registered in cluster");
});

function fxrequestHandler(message, replier) {
	replier(JSON.stringify(liveRates));
}

function evolveRates() {
	// decide how many items change
	var m = Math.floor(Math.random() * names.length);

	if (m == 0)
		return null;

	// shuffle and slice a la knuth
	for (var i = 0; i < m; ++i) {
		var pos = Math.floor(Math.random() * names.length),
			t = names[pos];
		names[pos] = names[0];
		names[0] = t;
	}
	var selection = names.slice(0, m);

	// evolve selection
	var message = {};
	for (var i = 0; i < selection.length; ++i) {
		var obj = liveRates[selection[i]];
		obj.value = randomRate(obj.value);
		obj.ts = Date.now();
		message[selection[i]] = obj;
	}
	return message;
}

function randomRate(seedRate) {
	var delta = ((Math.random() - 0.5) * 0.01);
	if ( (seedRate + delta) < 0 )
		delta = -delta;
	return round(seedRate + delta, 4);	
}

function round(num, decimals) {
	return Math.round(num*Math.pow(10,decimals))/Math.pow(10,decimals);
}



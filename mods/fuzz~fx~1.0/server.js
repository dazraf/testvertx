var vertx = require('vertx');
var container = require('vertx/container');
var http = require('vertx/http');
var log = container.logger;
var bus = vertx.eventBus;

var liveRates = {
	'eurusd.spot': {pair: 'eurusd', tenor: 'spot', value: 1.3791},
	'eurusd.1w': {pair: 'eurusd', tenor: '1w', value: -1.22},
	'eurgbp.spot': {pair: 'eurgbp', tenor: 'spot', value: 0.8341},
	'eurgbp.1w': {pair: 'eurgbp', tenor: '1w', value: -8.9}
};

var names = Object.getOwnPropertyNames(liveRates);

// evolve and publish every second
var timerIdSpot = vertx.setPeriodic(1000, function (timerId) {
	var message = evolveRates();
	bus.publish('fxservice.change', message);
})

bus.registerHandler('fxservice.request', fxrequestHandler, function() {
	log.info("fxservice.request registered in cluster");
});

function fxrequestHandler(message, replier) {
	replier(liveRates);
}

function evolveRates() {
	// decide how many items change
	var m = Math.floor(Math.random() * names.length);

	// shuffle and slice a la knuth
	for (var i = 0; i < m; ++i) {
		var pos = Math.floor(Math.random() * names.length),
			t = names[pos];
		names[pos] = names[0];
		names[0] = t;
	}
	var selection = names.slice(0, m);

	// evolve selection
	var message = {items: []};
	for (var i = 0; i < selection.length; ++i) {
		var obj = liveRates[selection[i]];
		obj.value = randomRate(obj.value);
		message.items.push(obj);
	}
	return message;
}

function randomRate(seedRate) {
	return round(seedRate + ((Math.random() - 0.5) * 0.01), 4);	
}

function round(num, decimals) {
	return Math.round(num*Math.pow(10,decimals))/Math.pow(10,decimals);
}



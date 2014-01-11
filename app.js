var vertx = require('vertx');
var container = require('vertx/container');
var log = container.logger;

container.deployModule('fuzz~web~1.0');
log.info("App: the web module is deployed");

container.deployModule('fuzz~event~1.0');
log.info("App: the event module is deployed");

container.deployModule('fuzz~fx~1.0');
log.info("App: the fx module is deployed");

container.deployModule('fuzz~rfp~1.0');
log.info("App: the rfp module is deployed");


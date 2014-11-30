/**
 * Handle Twilio
 */


var fs    = require('fs'),
nconf = require('nconf');

nconf.file('./sender/apidata.json');


var twilio = require('twilio');
var accountSid = nconf.get('twilio:accountSid');
var authToken = nconf.get('twilio:authToken');

var testTwilio = function(renderFn) {

	var client = new twilio.RestClient(accountSid, authToken);

	client.messages.create({
		to : '+',
		from : '(520) 447-4670',
		body : 'Hello World'
	}, function(error, message) {
		if (error) {
			console.log(error.message);
		}
	});
	renderFn(message);

}

var sendConfCode = function(subscriber, renderFn) {

	var client = new twilio.RestClient(accountSid, authToken);

	client.messages.create({
		to : subscriber.number,
		from : '(520) 447-4670',
		body : 'Please enter this confirmation code: '+ subscriber.confirmation_code,
	}, function(error, message) {
		if (error) {
			console.log(error.message);
			console.log(message);
		}
	});
	renderFn(subscriber);

}

exports.testTwilio = testTwilio;
exports.sendConfCode = sendConfCode;
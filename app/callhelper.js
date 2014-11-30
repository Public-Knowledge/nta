/**
 * New node file
 */

var Client = require('node-rest-client').Client;
var fs = require('fs'), nconf = require('nconf');

nconf.file('./sender/apidata.json');
var TwilioClient = require('twilio').Client, Twiml = require('twilio').Twiml, sys = require('sys');

var hostName = nconf.get('hostname');
var accountSid = nconf.get('twilio:accountSid');
var authToken = nconf.get('twilio:authToken');
var fromNumber = nconf.get('twilio:fromNumber');
//dev override for testing
//accountSid = "ACd3967671b70af900a43f25013c65a415";
//authToken = "21c366cec3376fcbb4aa17238e6f2dc1";
//fromNumber = "15005550006";




var handleStartCall = function(call) {
	console.log("handleStartCall", call);
	
	var client = require('twilio')(accountSid, authToken);

	var postUrl = hostName + '/connect?campaign=' + call.campaign_id + '&cts=' + call.target_set_id;
	
	if (call.connectCustom){
		postUrl  = postUrl + "&connectCustom=T";
	}else {
		//pass along district/state
		postUrl = postUrl + "&lat=" + call.late + "&long=" + call.long;
		
	}
	
	console.log("will send twilio post URL ", postUrl)
	///Place a phone call, and respond with TwiML instructions from the given URL
	client.makeCall({
	    to:call.number, // Any number Twilio can call
	    from: fromNumber, // A number you bought from Twilio and can use for outbound communication
	    url:   postUrl // A URL that produces an XML document (TwiML) which contains instructions for the call
	}, function(err, responseData) {
	    //executed when the call has been initiated.
	    console.log("call from: ", responseData.from, " in callback."); // outputs "+14506667788"
	    
	});
}


//check to see if alert has a connectCustom number

//otherwise if connecting to a senator or rep, get number from sunlight
//then dial their number
// <Dial>outbound number here</Dial>



var handleCampaignCall2 = function(call) {
	console.log("handle campaign call");
	console.log(call);
//	var call =  {
//			campaign_id: rows[0].alert_id,
//			number: rows[0].number,
//			connectCustom: rows[0].connectCustom,
//			connectCustomTitle: rows[0].connectCustomTitle,
//			target_set_id: rows[0].target_set_id
//			};
	
	var toNum = call.number;
	console.log("have to num:", toNum);
	
	var client = new TwilioClient(accountSid, authToken, "http://2bf9c4d6.ngrok.com/connect");
	
	console.log("new twilio client created");
	var phone = client.getPhoneNumber('+15204474670');

	//makeCall function has 3 args
	//The phone number to dial
	//a map of options
	//a callback function

	phone.setup(function() {
		console.log("calling make call");
		phone.makeCall(toNum, null, function(call) {
			call.on('answered', function(callParams, response) {
				response.append(new Twiml.Say('Hello this is a test call'));
				response.send();
			});
		});
	});
}



//var client = require('twilio')('ACCOUNT_SID', 'AUTH_TOKEN');

///Place a phone call, and respond with TwiML instructions from the given URL
//client.makeCall({

//    to:'+16515556677', // Any number Twilio can call
//    from: '+14506667788', // A number you bought from Twilio and can use for outbound communication
//    url: 'http://www.example.com/twiml.php' // A URL that produces an XML document (TwiML) which contains instructions for the call

//}, function(err, responseData) {

    //executed when the call has been initiated.
//    console.log(responseData.from); // outputs "+14506667788"

//});


exports.handleStartCall = handleStartCall;

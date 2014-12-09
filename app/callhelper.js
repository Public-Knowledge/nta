/**
 * New node file
 */



var mysql = require('mysql');
var SunlightClient = require('sunlight').SunlightClient;

//var Client = require('node-rest-client').Client;
var fs = require('fs'), nconf = require('nconf');

nconf.file('./sender/apidata.json');
var TwilioClient = require('twilio').Client, Twiml = require('twilio').Twiml, sys = require('sys');

var hostName = nconf.get('hostname');
var accountSid = nconf.get('twilio:accountSid');
var authToken = nconf.get('twilio:authToken');
var fromNumber = nconf.get('twilio:fromNumber');





var connection = mysql.createConnection({
	host : nconf.get('database:host'),
	user : nconf.get('database:user'),
	password : nconf.get('database:password'),
	database : 'txtapp',
	multipleStatements: true
});


var handleStartCall = function(call) {

	console.log("handleStartCall", call);
	
	var client = require('twilio')(accountSid, authToken);
	var postUrl = hostName + '/connect?campaign=' + call.campaign_id  + "&lat=" + call.lat + "&long=" + call.long + "&state=" + call.state;
	
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



var dialOutboundSunlight = function(call, renderFn) {

	//<Say>Calling <%= call.title %></Say>
   
//    <Say> Will call <%= call.number %> </Say>
	
	console.log("dialOutbound Sunlight", call);
	//get sunlight rep 
	 var sunlightApiKey = nconf.get('sunlight:apikey');
	    var sunlight = new SunlightClient(sunlightApiKey);
	    
	    var senior = {};
	    var junior = {};
	    var rep = {};
	    sunlight.legislators.allForLatLong(call.lat, call.long, function(legs) {
	    	console.log(legs);
	    	for (leg in legs) {
	    		
	    		if (legs[leg].district.indexOf('Senior') > -1) {	 
					    senior.phone = legs[leg].phone;
					    senior.name = "Senator " + legs[leg].lastname;
				} else if (legs[leg].district.indexOf('Junior') > -1) {
					 junior.name = "Senator "+ legs[leg].lastname;
					    junior.phone = legs[leg].phone;
				} else if (legs[leg].district.indexOf(' ') <= 0){
					 rep.name = "Represenative "+ legs[leg].lastnam;
						    rep.phone = legs[leg].phone;
				}
	    	}
	    	if (call.digits == 1){
	    		//connect senior
	    		call.title = senior.name;
	    		call.number = senior.phone;
	    	}else if (call.digits == 2){
	    		//connect junior
	    		call.title = junior.name;
	    		call.number = junior.phone;
	    	}else if (call.digits == 3){
	    		//connect rep
	    		call.title = rep.name;
	    		call.number = rep.phone;
	    	}
	    	console.log("generating outbound dial: ", call);
			renderFn(call);
			
	    });
	
}

var dialOutboundCustom = function(call, renderFn) {

	
	//<Say>Calling <%= call.title %></Say>
	   
//  <Say> Will call <%= call.number %> </Say>
	
	console.log("dialOutbound Custom", call);
	var sql = 'SELECT c.connectCustom, c.connectCustomTitle FROM  alert c ' +
	'WHERE c.id=' + connection.escape(call.campaign_id);

	console.log("sql: ", sql)

	connection.query(sql, function(err, rows) {
		if (err)
			throw err;
		console.log("db returned: ", rows);
		for (r in rows) {

			if (rows[r].connectCustom){
				call.number = rows[r].connectCustom;
				call.title = rows[r].connectCustomTitle;
			}
		}
		renderFn(call);
	});
	
}

var generateSwitchboard = function(call, renderFn) {
	
	console.log("generating switchboard");
	//var call =  {
	//		campaign_id: req.param('campaign'),
	//		number: req.param('From'),		
	//		lat: req.param('lat'),
	//		long: req.param('long'),
	//	    state: req.param('state'),
	//		};
	
	call.webhost = hostName;

	call.action_url = "dial?campaign_id=" + call.campaign_id +
	"&lat=" + call.lat +
	"&long=" + call.long +
	"&state=" + call.state;
	
	console.log("action url is ", call.action_url);
	//find possible targets for campaign
	//also get custom settings
	var sql = 'SELECT c.audio, c.connectCustom, c.connectCustomTitle, ts.rep_id, ts.geo_target FROM  campaign_target_sets cts, target_sets ts, alert c ' +
			'WHERE c.id=' + connection.escape(call.campaign_id) + ' and cts.alert_id=c.id and ts.id = cts.target_set_id';
	
	console.log("sql: ", sql)
	
	connection.query(sql, function(err, rows) {
	if (err)
		throw err;
	console.log("db returned: ", rows);
	
	for (r in rows) {
		
		call.audio = rows[r].audio;
		
		//if connectCustom is set, add that to switchboard
		if (rows[r].connectCustom){

			call.connectCustom = 1;
			call.customTitle = rows[r].connectCustomTitle;
			console.log("connect Custom is ", call.connectCustom);
			
		}
		console.log("geo: ", rows[r].geo_target);
		
		//if nationwide or their state all is set, add senior/junior/rep to switchboard
		
		var currentGeoTarget = rows[r].geo_target.toString();

		if ((currentGeoTarget == 00) || (currentGeoTarget == call.state)){
		
			if (rows[r].rep_id == 4){
				//add all 3
				call.connectSenior = 1;
				call.connectJunior = 1;
				call.connectRep = 1;
			
			}else if (rows[r].rep_id == 1){
				//senior senator
				call.connectSenior = 1;
				
			}else if (rows[r].rep_id == 2){
				//junior senator
				call.connectJunior = 1;
			}else if (rows[r].rep_id == 3){
				//represenative
				call.connectRep = 1;
			}
		}		
	}
	console.log("call before rendering XML", call);
	renderFn(call);
});
	
}



	
exports.dialOutboundCustom = dialOutboundCustom;	
exports.dialOutboundSunlight = dialOutboundSunlight;
exports.handleStartCall = handleStartCall;
exports.generateSwitchboard = generateSwitchboard;

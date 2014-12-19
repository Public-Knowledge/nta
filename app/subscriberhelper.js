/**
 * MySQL queries
 */

var mysql = require('mysql');
var SunlightClient = require('sunlight').SunlightClient;

var fs    = require('fs'),
nconf = require('nconf');

nconf.file('./sender/apidata.json');


var connection = mysql.createConnection({
	host : nconf.get('database:host'),
	user : nconf.get('database:user'),
	password : nconf.get('database:password'),
	database : nconf.get('database:database'),
	multipleStatements: true
});



var listSubscribers = function(renderFn) {

	connection
			.query(
					'select * from subscriber',
					function(err, rows) {
						if (err)
							throw err;
						renderFn(rows);
					});


}
var getSubscriberById = function(id, renderFn) {

	var sql = 'SELECT * FROM subscriber WHERE user_id = '
			+ connection.escape(id);
	connection.query(sql, function(err, rows) {
		if (err)
			throw err;
		// return rows;
		

		renderFn(rows);
	});

}


var getSubscriberByNumber = function(number, renderFn) {

	var sql = 'SELECT * FROM subscriber WHERE number = '
			+ connection.escape(number);
	connection.query(sql, function(err, rows) {
		if (err)
			throw err;
		// return rows;
		renderFn(rows);
	});

}

var getSubscriberForCall = function(number, renderFn) {

	// incoming phone number: look up whether they are active, get campaign
	// select c.`connectCustom`, c.`connectCustomTitle`, cts.`target_set_id`,  s.alert_id, s.`sent_time` 
	// from sent s, subscriber sub, alert c, campaign_target_sets cts 
	// where sub.`user_id`= s.`user_id` and sub.`number` = '2062295959'  and sub.`status`=1 and c.`id` = s.alert_id  
	// and cts.`alert_id` = c.`id` ORDER BY s.`sent_time` DESC limit 1;
	
	//also need to get whether campaign has custom phone # to connect to
	
	var sql = 'select sub.state, sub.`lat`, sub.`long`, sub.`number`,  s.alert_id, s.`sent_time` ' +
		' from sent s, subscriber sub, alert c ' + 
		' where sub.`user_id`= s.`user_id` and sub.`number` = ' + connection.escape(number) + '  and sub.`status`=1 and c.`id` = s.alert_id  ' +
		' ORDER BY s.`sent_time` DESC limit 1;';
		
	
	connection.query(sql, function(err, rows) {	
		if (err)
			throw err;
	
		var call =  {
				campaign_id: rows[0].alert_id,
				number: rows[0].number,				
				lat: rows[0].lat,
				long: rows[0].long,
				state: rows[0].state,
				};
	
		renderFn(call);
	});

}



var handleOngoingCallCustom = function(call, renderFn) {
	
	//also need to get whether campaign has custom phone # to connect to
	
	var sql = 'select c.audio, c.`connectCustom`, c.`connectCustomTitle` from  alert c where c.`id` = ' 
		+ connection.escape(call.campaign_id) + ' limit 1;';
		
	connection.query(sql, function(err, rows) {	
		if (err)
			throw err;

		call.connectCustomNumber = rows[0].connectCustom;
		call.connectCustomTitle = rows[0].connectCustomTitle;
		call.audio = rows[0].audio;
		renderFn(call);
	});

}

var handleOngoingCallSunlight = function(call, renderFn) {

	var rep = {};
	
	var sql = 'select * from  alert c, target_sets ts, campaign_target_sets cts ' +
	'where c.`id` =' + connection.escape(call.campaign_id) +   
	'and c.id = cts.`alert_id` and ts.`id` = cts.`target_set_id` limit 1';

	connection.query(sql, function(err, rows) {	
		if (err)
			throw err;

		call.audio = rows[0].audio;
		
		//get sunlight rep 
		 var sunlightApiKey = nconf.get('sunlight:apikey');
		    var sunlight = new SunlightClient(sunlightApiKey);
		    
		    var senior = {};
		    var junior = {};
		    var rep = {};
		    sunlight.legislators.allForLatLong(call.lat, call.long, function(legs) {
		    	 
		    	for (leg in legs) {
		    		 
		    		if (legs[leg].district.indexOf('Senior') > -1) {
						 
						    senior.phone = legs[leg].phone;
					} else if (legs[leg].district.indexOf('Junior') > -1) {
						 
						    junior.phone = legs[leg].phone;
					} else if (legs[leg].district.indexOf(' ') <= 0){
							     
							    rep.phone = legs[leg].phone;
					}
		    	}
		    	
		    	call.targetType = rows[0].rep_id;
		
				// 4 == all
				// 1 == senior senator
				// 2 == junior senator
				// 3 == represenative
				
				if (call.targetType == 1){
					call.repNumber = senior.phone;
					
				} else if (call.targetType == 2){
					call.repNumber = junior.phone
				} else if (call.targetType == 3){
					call.repNumber = rep.phone;
					
				}
		    	renderFn(call);
		    });
		 });
}

var handleOngoingCall = function(call, renderFn) {

	//also need to get whether campaign has custom phone # to connect to
	
	var sql = 'select  sub.`number`, c.`connectCustom`, c.`connectCustomTitle`, cts.`target_set_id`,  s.alert_id, s.`sent_time` ' +
		' from sent s, subscriber sub, alert c, campaign_target_sets cts ' + 
		' where sub.`user_id`= s.`user_id` and sub.`number` = ' + connection.escape(number) + '  and sub.`status`=1 and c.`id` = s.alert_id  ' +
		' and cts.`alert_id` = c.`id` ORDER BY s.`sent_time` DESC limit 1;';
		
	
	connection.query(sql, function(err, rows) {	
		if (err)
			throw err;
	
		var call =  {
				campaign_id: rows[0].alert_id,
				number: rows[0].number,
				connectCustom: rows[0].connectCustom,
				connectCustomTitle: rows[0].connectCustomTitle,
				target_set_id: rows[0].target_set_id
				};
	
		renderFn(call);
	});

}


var updateSubscriber = function(
first_name, last_name, email, address, city, state, zipcode, lat, long, district, status, number, user_id) {

	var sql = 'update subscriber set first_name=' + connection.escape(first_name)
			+ ', last_name =' + connection.escape(last_name)
			+ ', email =' + connection.escape(email)
			+ ', address =' + connection.escape(address)
			+ ', city =' + connection.escape(city)
			+ ', state =' + connection.escape(state)
			+ ', zipcode =' + connection.escape(zipcode)
			+ ', lat =' + connection.escape(lat)
			+ ', `long` =' + connection.escape(long)
			+ ', district =' + connection.escape(district)
			+ ', status =' + connection.escape(status)
			+ ', number =' + connection.escape(number)
			+ ' where user_id='
			+ connection.escape(user_id);

	console.log(sql);

	connection.query(sql, function(err, rows) {
		if (err)
			throw err;

	});
}



var unsubscribe = function(subscriber_number, renderFn) {

	
	
	var sql = 'update subscriber set status="0" where number=' + 
		connection.escape(subscriber_number);

	console.log(sql);

	connection.query(sql, function(err, rows) {
		if (err)
			throw err;
		renderFn(subscriber_number);
	});
}


var addSubscriber = function(subscriber, renderFn) {

	
	//need to round lat/long
	
	var roundedLat = Math.round(subscriber.lat * 100)/100;
	var roundedLong = Math.round(subscriber.long * 100)/100;
	
	var sql = 'insert into subscriber (`number`, `first_name`, `last_name`, `email`, ' +
		'`address`, `city`, `state`, `zipcode`, `lat`, `long`, `district`, `status`) VALUES(' + 
		connection.escape(subscriber.number) + ',' +
		connection.escape(subscriber.first_name) + ',' +
		connection.escape(subscriber.last_name) + ',' +
		connection.escape(subscriber.email) + ',' +
		connection.escape(subscriber.address) + ',' +
		connection.escape(subscriber.city) + ',' +
		connection.escape(subscriber.state) + ',' +
		connection.escape(subscriber.zipcode) + ',' +
		connection.escape(roundedLat) + ',' +
		connection.escape(roundedLong) + ',' +
		connection.escape(subscriber.district) + ',' +
		connection.escape(subscriber.status) +')';

	console.log(sql);

	connection.query(sql, function(err, rows) {
		if (err)
			throw err;
		renderFn(subscriber);
	});
}

exports.unsubscribe = unsubscribe;
exports.handleOngoingCallSunlight = handleOngoingCallSunlight;
exports.handleOngoingCallCustom = handleOngoingCallCustom;
exports.handleOngoingCall = handleOngoingCall;
exports.getSubscriberForCall = getSubscriberForCall;
exports.listSubscribers = listSubscribers;
exports.getSubscriberByNumber = getSubscriberByNumber;
exports.getSubscriberById = getSubscriberById;
exports.updateSubscriber = updateSubscriber;
exports.addSubscriber = addSubscriber;

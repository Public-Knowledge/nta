var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var multer  = require('multer');
var xml = require('xml');


var routes = require('./routes/index');
var users = require('./routes/users');
console.log(process.env);

var app = express();
app.use(multer({ dest: './public/data/',
		rename: function (fieldname, filename) {
	    return filename.replace(/\W+/g, '-').toLowerCase() + Date.now()
		}
		}));
/*
 * Set-up 
 */

app.set('view engine', 'html');
//view engine setup
app.set('views', path.join(__dirname, 'views'));
app.engine('html', require('ejs').renderFile);
app.set('port', process.env.PORT || 3000);
app.use(express.static(path.join(__dirname, 'public')));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
	extended : false
}));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));


var dbHelper = require(__dirname + '/app/dbhelper');
var twilioHelper = require(__dirname + '/app/twilio');
var subscriberHelper = require(__dirname + '/app/subscriberhelper');
var geocodeHelper = require(__dirname + '/app/geocode');
//var callHelper = require(__dirname + '/app/callhelper');

var routes = require('./routes/index');
var users = require('./routes/users');


app.get('/', function(req, res) {

	var twilioTest = twilioHelper.testTwilio(function(message) {
		res.send('Hello World!');
		res.send(message);
	});
});

app.get('/subscribers', function(req, res) {

	var rows = subscriberHelper.listSubscribers(function(rows) {
		res.render('view_all_subscribers.html', {
			title : "See Subscribers",
			subscribers : rows
		});
	});
});

app.get('/connect', function(req, res) {
	var subscriberNumber = req.param('From');
	
	//look for unsub or act command in body
//	var action = req.param('Body');
//	if (action.indexOf("stop") > -1){
//		var unsub = callHelper.unsubscribe(subscriberNumber, function(subscriber) {
//			res.render('unsubscribe.html', {
//				subscriber : subscriber
//			});
//		});
		
//	}else if (action.indexOf("act") > -1) {
//		var act = callHelper.handleCampaignCall(subscriberNumber, function(subscriber) {
	//res.set('Content-Type', 'text/xml');
	res.render('calls/call.html', {
					title: "this is a title"
			});
//		});
		
//	} else {
		//error, unknown!
//	}
	
});

app.get('/connects', function(req, res) {
	var subscriberNumber = req.param('From');
	
	//look for unsub or act command in body
	var action = req.param('Body');
	if (action.indexOf("stop") > -1){
		var unsub = callHelper.unsubscribe(subscriberNumber, function(subscriber) {
			res.render('unsubscribe.html', {
				subscriber : subscriber
			});
		});
		
	}else if (action.indexOf("act") > -1) {
		var act = callHelper.handleCampaignCall(subscriberNumber, function(subscriber) {
	//res.set('Content-Type', 'text/xml');
	res.render('calls/call.html', {
					title: "this is a title"
			});
		});
		
	} else {
		//error, unknown!
	}
	
});



app.get('/campaigns', function(req, res) {

	var rows = dbHelper.listCampaigns(function(rows) {
		res.render('view_all_campaigns.html', {
			title : "See Campaigns",
			campaigns : rows
		});
	});
});

app.get('/campaign', function(req, res) {
	campaign_id = req.param("id");
	var rows = dbHelper.getCampaignWithTargets(campaign_id, function(campaign) {
		res.render('view_campaign_with_targets.html', {
			title : "Campaign " + campaign_id,
			campaign : campaign
		});
	});
});


app.get('/edit-campaign', function(req, res) {
	campaign_id = req.param("id");

	var rows = dbHelper.getCampaign(campaign_id, function(rows) {
		res.render('edit_campaign.html', {
			title : "Edit Campaign",
			campaigns : rows
		});
	});
});

app.get('/new-campaign', function(req, res) {
		res.render('add_campaign.html', {
			title : "New Campaign",		
		});	
});

app.get('/edit-campaign-targets', function(req, res) {
	campaign_id = req.param("id");
	var rows = dbHelper.getCampaignTargets(campaign_id, function(campaign) {
		res.render('update_campaign_targets.html', {
			title : "Edit Campaign Targets",
			campaign : campaign
		});
	});	
});

//edit campaign targets
//update_campaign

app.post('/update_campaign_targets',function(req, res) {
	var campaign =  {
			targets: req.param("state"),
			id: req.param("id") };

			console.log(campaign);
		
			dbHelper.updateCampaignTargetsFirst(campaign, 
					 function lastone() { res.redirect('/campaign?id=' + campaign.id); });
					
});

//add campaign

app.post('/add_campaign', function(req, res) {
	
		var campaign =  {
			day : req.param("day"),
			time : req.param("time"),
			connectCustomTitle: req.param("connectCustomTitle"), 
			connectCustom: req.param("connectCustom"),
			target: req.param("state"),
			sms: req.param("sms"),
			mp3_file_location: req.files.mp3file.path};
		
			console.log(campaign.mp3_file_location);	
			
			var timeParts = campaign.time.split(":");
			var dateParts = campaign.day.split("/");
			// new Date(year, month, day, hours, minutes,)
			// month is zero based!!
			var d = new Date(dateParts[2], dateParts[0] - 1, dateParts[1],
					timeParts[0], timeParts[1]);
			tmp = d.getTime();
			dateInEpoch = tmp / 1000;
			campaign.dateInEpoch = dateInEpoch;
			console.log(campaign);
			
			dbHelper.addCampaign(campaign, function(campaign) {
				res.render('view_campaign_with_targets.html', {
					title : "New Campaign ",
					campaign : campaign
				});
			});
});




// update_campaign

app.post('/update_campaign', function(req, res) {

	var campaign = {
		target : req.param("state"),
		day : req.param("day"),
		time : req.param("time"),
		id : req.param("id"),
		connectCustomTitle : req.param("connectCustomTitle"),
		connectCustom : req.param("connectCustom"),
		sms : req.param("sms")
	};

	// mp3File: req.files.mp3file.path
	if (req.files.mp3file) {
		console.log("Req.Files.Mp3file: " + req.files.mp3file.path);
		console.log(campaign.mp3File);
		campaign.mp3File = req.files.mp3file.path;
	} else {
		console.log("Req.Files.Mp3file was not set");
		console.log("set to: ", req.param("prevfile"));
		campaign.mp3File = req.param("prevfile");
	}

	var timeParts = campaign.time.split(":");
	var dateParts = campaign.day.split("/");
	// new Date(year, month, day, hours, minutes,)
	// month is zero based!!
	var d = new Date(dateParts[2], dateParts[0] - 1, dateParts[1],
			timeParts[0], timeParts[1]);
	tmp = d.getTime();
	dateInEpoch = tmp / 1000;
	campaign.dateInEpoch = dateInEpoch;

	dbHelper.updateCampaign(campaign, function(campaign) {
		res.render('view_campaign_with_targets.html', {
			title : "Updated Campaign ",
			campaign : campaign
		});
	});

});

app.get('/edit-subscriber', function(req, res) {
	user_id = req.param("user_id");

	var rows = subscriberHelper.getSubscriberById(user_id, function(rows) {
		res.render('edit_subscriber.html', {
			title : "Edit Subscriber",
			subscribers : rows
		});
	});
});

//update_subscriber

app.post('/update_subscriber', function(req, res) {
	console.log(req.body);

	//first_name, last_name, email, address, city, state, zip, lat, long, district, status, number, id
	subscriberHelper.updateSubscriber(req.param("first_name"), req
			.param("last_name"), req.param("email"), req.param("address"), req
			.param("city"), req.param("state"), req.param("zipcode"), req
			.param("lat"), req.param("long"), req.param("district"), req
			.param("status"), req.param("number"), req.param("user_id"));
	var rows = subscriberHelper.listSubscribers(function(rows) {
		res.render('view_all_subscribers.html', {
			title : "See Subscribers",
			subscribers : rows
		});
	});
});

//new subscriber - render signup step 0
app.get('/signup', function(req, res) {
	res.render('new_subscriber.html', {
		title : "Signup"
	});
});

//new subscriber - look up reps - signup step #1

app.post('/add_subscriber', function(req, res) {
	console.log(req.body);

	var subscriber = {
		first_name : req.param("first_name"),
		last_name : req.param("last_name"),
		email : req.param("email"),
		address : req.param("address"),
		city : req.param("city"),
		state : req.param("state"),
		zipcode : req.param("zipcode"),
		number : req.param("number"),
		lat : "",
		long : "",
	};
	var legs = geocodeHelper.getSubscriberReps(subscriber, function(subscriber,
			legs) {
		res.render('confirm_reps.html', {
			subscriber : subscriber,
			reps : legs
		});
	});
});

//reps confirmed. now send code via sms to confirm phone num
app.post('/reps_confirmed', function(req, res) {
	console.log(req.body);
	user_number = req.param("number");
	// Get 3 random numbers between 0 and 9
	var confcode = "pk";

	var one = Math.floor((Math.random() * 100) + 1);
	var two = Math.floor((Math.random() * 100) + 1);
	var three = Math.floor((Math.random() * 100) + 1);
	confcode = confcode + one + two + three;
	console.log(confcode);
		var subscriber = {
			first_name : req.param("first_name"),
			last_name : req.param("last_name"),
			email : req.param("email"),
			address : req.param("address"),
			city : req.param("city"),
			state : req.param("state"),
			zipcode : req.param("zipcode"),
			number : req.param("number"),
			district : req.param("district"),
			lat : req.param("lat"),
			long : req.param("long"),
			confirmation_code : confcode
		};
		twilioHelper.sendConfCode(subscriber, function(subscriber) {
			res.render('confirm_subscribe_code.html', {
				title : "Confirm User Code",
				subscriber : subscriber
			});
		});
	
});

//confirm_subscribe_code
app.post('/confirm_subscribe_code', function(req, res) {
	console.log(req.body);
	entered_code = req.param("confirmation_code");
	user_code = req.param("entered_code");

	var subscriber = {
		first_name : req.param("first_name"),
		last_name : req.param("last_name"),
		email : req.param("email"),
		address : req.param("address"),
		city : req.param("city"),
		state : req.param("state"),
		zipcode : req.param("zipcode"),
		number : req.param("number"),
		district : req.param("district"),
		lat : req.param("lat"),
		long : req.param("long"),
		status: 1
	};

	if (entered_code == user_code) {
		console.log("codes match");
		
		subscriberHelper.addSubscriber(subscriber, function(subscriber) {
		res.render('thank_you.html', {
			title : "Thank you",
			subscriber : subscriber
		});
		});
	}else{
		res.render('error_code.html', {
			title : "Try Again",
			subscriber : subscriber
		});
	}
});



var server = app.listen(3000, function() {

	var host = server.address().address
	var port = server.address().port

	console.log('App listening at http://%s:%s', host, port)

})

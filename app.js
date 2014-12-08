var express = require('express');
var http = require('http');
var path = require('path');
var passport = require('passport');
var googleStrategy = require('passport-google-oauth').OAuth2Strategy;
var cookieParser = require('cookie-parser');
var bodyParser   = require('body-parser');
var session      = require('express-session');
var fs    = require('fs'),
nconf = require('nconf');
nconf.file('./sender/apidata.json');

//var routes = require('./routes/index');
//var users = require('./routes/users');


var logger = require('morgan');
var multer  = require('multer');

console.log(process.env);

var app = express();
app.use(cookieParser()); // read cookies (needed for auth)
app.use(bodyParser()); // get information from html forms
var sessionSecret = nconf.get('oauth:secret');
var restricted_domain = nconf.get('oauth:restricted_domain');

// required for passport
app.use(session({ secret:  sessionSecret}));

app.use(multer({ dest: './public/data/',
		rename: function (fieldname, filename) {
	    return filename.replace(/\W+/g, '-').toLowerCase() + Date.now()
		}
		}));
/*
 * Set-up 
 */

app.set('view engine', 'html');
app.set('views', path.join(__dirname, 'views'));
app.engine('html', require('ejs').renderFile);
app.set('port', process.env.PORT || 3000);

app.use(passport.initialize());
app.use(passport.session());

app.use(express.static(path.join(__dirname, 'public')));
app.use(express.static(path.join(__dirname, 'media'))); 
	

console.log("__dirname is ", __dirname);
var dbHelper = require(__dirname + '/app/dbhelper');
var twilioHelper = require(__dirname + '/app/twilio');
var subscriberHelper = require(__dirname + '/app/subscriberhelper');
var geocodeHelper = require(__dirname + '/app/geocode');
var callHelper = require(__dirname + '/app/callhelper');



var client_id = nconf.get('oauth:client_id');
var client_secret = nconf.get('oauth:client_secret');
var redirect_path = nconf.get('oauth:redirect');
var hostName = nconf.get('hostname');
var redirect_url = hostName + redirect_path;
console.log(redirect_url);

// Passport session setup.
//   To support persistent login sessions, Passport needs to be able to
//   serialize users into and deserialize users out of the session.  Typically,
//   this will be as simple as storing the user ID when serializing, and finding
//   the user by ID when deserializing.  However, since this example does not
//   have a database of user records, the complete Google profile is
//   serialized and deserialized.
passport.serializeUser(function(user, done) {
	
  	done(null, user);
});

passport.deserializeUser(function(obj, done) {
	
  done(null, obj);
});



passport.use(new googleStrategy({
    clientID: client_id,
    clientSecret: client_secret,
    callbackURL: redirect_url
},
function (accessToken, refreshToken, profile, done) {
 
    process.nextTick(function () {
     
      return done(null, profile);
    });
    }
));    
    


    
app.get('/auth/google',
  passport.authenticate('google', { scope: ['https://www.googleapis.com/auth/userinfo.profile',
                                            'https://www.googleapis.com/auth/userinfo.email'] }),
  function(req, res){	
    // The request will be redirected to Google for authentication, so this
    // function will not be called.
  });

app.get('/auth/google/callback', 
	   passport.authenticate('google',  
        { successRedirect: '/campaigns',
        failureRedirect: '/login',
        session: true }));


app.get('/login', function(req, res){
  res.redirect('/auth/google');
});


app.get('/logout', function(req, res){
  req.logout();
  res.redirect('/');
});


app.get('/',  function(req, res) {
		res.render('homepage.html');

});

app.get('/subscribers', ensureAuthenticated, function(req, res) {

	var rows = subscriberHelper.listSubscribers(function(rows) {
		res.render('view_all_subscribers.html', {
			title : "See Subscribers",
			subscribers : rows
		});
	});
});

app.post('/dial', function(req, res) {
	console.log(req.body);
	console.log("POST dial");
	
	var call = {
				lat: req.param('lat'),
				long: req.param('long'),
				campaign_id: req.param('campaign'),
				number: req.param('From'),
				state: req.param('state'),
				digits: req.param('Digits')
	  };
	  console.log("call obj ", call);
	  
		var rows = callHelper.dialOutbound(call, function(call) {
			res.render('calls/switchboard.html', {
				call: call
			});
		});
});


app.get('/dial', function(req, res) {
	console.log(req.body);
	console.log("get dial");
	
	var call = {
				lat: req.param('lat'),
				long: req.param('long'),
				campaign_id: req.param('campaign_id'),
				number: req.param('From'),
				state: req.param('state'),
				digits: req.param('Digits')
	  };
	  console.log("call obj ", call);
	  if (call.digits == 0){
	  
		var rows = callHelper.generateSwitchboard(call, function(call) {
			res.render('calls/switchboard.html', {
				call: call
			});
		});
	  
	  }else if (call.digits == 5){
	  //connect custom
	  var rows = callHelper.dialOutboundCustom(call, function(call) {
			res.render('calls/call.html', {
				call: call
			});
		});
	  } else{
		var rows = callHelper.dialOutboundSunlight(call, function(call) {
			res.render('calls/call.html', {
				call: call
			});
		});
		}
});

app.get('/connect', function(req, res) {
	console.log("GET version of connect.");
	console.log(req.body);
	
		var call =  {
				campaign_id: req.param('campaign'),
				number: req.param('From'),
				state: req.param('state'),
				lat: req.param('lat'),
				long: req.param('long')
				};
		
		var rows = callHelper.generateSwitchboard(call, function(call) {
			res.render('calls/switchboard.html', {
				call: call
			});
		});
});

app.post('/connect', function(req, res) {
	console.log("POST version of connect.");
	console.log(req.body);
	
		var call =  {
				lat: req.param('lat'),
				long: req.param('long'),
				campaign_id: req.param('campaign'),
				number: req.param('From'),
				state: req.param('state')
				};
	
	
		
		var rows = callHelper.generateSwitchboard(call, function(call) {
			res.render('calls/switchboard.html', {
				call: call
			});
		});
});


app.get('/connects', function(req, res) {
	var subscriber_number = req.param('From');
	var action = "unknown";
	
	//look for unsub or act command in body
	if (req.param('Body')) {
		
		action = req.param('Body');
	}

	if (action.indexOf("stop") > -1){
		var unsub = subscriberHelper.unsubscribe(subscriber_number, function(subscriber) {
			res.render('unsubscribe.html', {
				subscriber_number : subscriber_number
			});
		});
		
	}else if (action.indexOf("act") > -1) {
		// to do
		// look up the campaign & make call for that campaign
		//var call = {};
		var act = subscriberHelper.getSubscriberForCall(subscriber_number, function(call) {
			callHelper.handleStartCall(call)
		});
		
	} else {
		//error, unknown!
	}
	
});



app.get('/campaigns', ensureAuthenticated, function(req, res) {

	var rows = dbHelper.listCampaigns(function(rows) {
		res.render('view_all_campaigns.html', {
			title : "See Campaigns",
			campaigns : rows
		});
	});
});

app.get('/campaign', ensureAuthenticated, function(req, res) {
	campaign_id = req.param("id");
	
	var rows = dbHelper.getCampaignWithTargets(campaign_id, function(campaign) {
		res.render('view_campaign_with_targets.html', {
			title : "Campaign " + campaign_id,
			campaign : campaign
		});
	});
});


app.get('/edit-campaign', ensureAuthenticated, function(req, res) {
	campaign_id = req.param("id");

	var rows = dbHelper.getCampaign(campaign_id, function(rows) {
		res.render('edit_campaign.html', {
			title : "Edit Campaign",
			campaigns : rows
		});
	});
});

app.get('/new-campaign', ensureAuthenticated, function(req, res) {
		res.render('add_campaign.html', {
			title : "New Campaign",		
		});	
});

app.get('/edit-campaign-targets', ensureAuthenticated,  function(req, res) {
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

app.post('/update_campaign_targets', ensureAuthenticated, function(req, res) {
	var campaign =  {
			targets: req.param("state"),
			id: req.param("id") };

			dbHelper.updateCampaignTargetsFirst(campaign, 
					 function lastone() { res.redirect('/campaign?id=' + campaign.id); });
					
});

//add campaign

app.post('/add_campaign', ensureAuthenticated, function(req, res) {
	
		var campaign =  {
			day : req.param("day"),
			time : req.param("time"),
			connectCustomTitle: req.param("connectCustomTitle"), 
			connectCustom: req.param("connectCustom"),
			targets: req.param("state"),
			sms: req.param("sms"),
			audio: req.files.mp3file.path};
		
			
			var timeParts = campaign.time.split(":");
			var dateParts = campaign.day.split("/");
			// new Date(year, month, day, hours, minutes,)
			// month is zero based!!
			var d = new Date(dateParts[2], dateParts[0] - 1, dateParts[1],
					timeParts[0], timeParts[1]);
			tmp = d.getTime();
			dateInEpoch = tmp / 1000;
			campaign.dateInEpoch = dateInEpoch;
		
			dbHelper.addCampaign(campaign, function(campaign_id) {
				res.redirect('/campaign?id=' + campaign_id);
				});
			
});




// update_campaign

app.post('/update_campaign', ensureAuthenticated, function(req, res) {

	var campaign = {
		target : req.param("state"),
		day : req.param("day"),
		time : req.param("time"),
		id : req.param("id"),
		connectCustomTitle : req.param("connectCustomTitle"),
		connectCustom : req.param("connectCustom"),
		sms : req.param("sms")
	};

	if (req.files.mp3file) {
	
		campaign.audio = req.files.mp3file.path;
	} else {
		
		campaign.audio = req.param("prevfile");
		
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
		 res.redirect('/campaign?id=' + campaign.id);
	});
});

app.get('/edit-subscriber', ensureAuthenticated, function(req, res) {
	user_id = req.param("user_id");

	var rows = subscriberHelper.getSubscriberById(user_id, function(rows) {
		res.render('edit_subscriber.html', {
			title : "Edit Subscriber",
			subscribers : rows
		});
	});
});

//update_subscriber

app.post('/update_subscriber', ensureAuthenticated, function(req, res) {

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

	user_number = req.param("number");
	// Get 3 random numbers between 0 and 9
	var confcode = "pk";

	var one = Math.floor((Math.random() * 100) + 1);
	var two = Math.floor((Math.random() * 100) + 1);
	var three = Math.floor((Math.random() * 100) + 1);
	confcode = confcode + one + two + three;

	var keyString = 'user:' + user_number;
	console.log("storing under ", keyString);
	console.log(confcode);
	
	nconf.set(keyString, confcode);
	
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
	var user_number = req.param("number");
	
	var keyString = 'user:' + user_number;
	

	
	entered_code = req.param("confirmation_code");
	user_code = req.param("entered_code");
	stored_code = nconf.get(keyString);
	
	var subscriber = {
		first_name : req.param("first_name"),
		last_name : req.param("last_name"),
		email : req.param("email"),
		address : req.param("address"),
		city : req.param("city"),
		state : req.param("state"),
		zipcode : req.param("zipcode"),
		number : user_number,
		district : req.param("district"),
		lat : req.param("lat"),
		long : req.param("long"),
		status: 1
	};

	if (entered_code == user_code) {
	
		
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



// Simple route middleware to ensure user is authenticated.
//   Use this route middleware on any resource that needs to be protected.  If
//   the request is authenticated (typically via a persistent login session),
//   the request will proceed.  Otherwise, the user will be redirected to the
//   login page.
function ensureAuthenticated(req, res, next) {
	   	//console.log("in ensureAuth", req.isAuthenticated());
    	//console.log("session data", req.session);
    	//console.log("user data", req.user);
    	
   //current hack
  //restrict access to authenticated sites by user email domain  
  //could also use groups? https://developers.google.com/google-apps/provisioning/#retrieving_all_groups_for_a_member	
  if (req.isAuthenticated() && req.user.emails[0].value.indexOf(restricted_domain) > -1) { 
  	return next(); 
  }
  res.redirect('/login');
}


var server = app.listen(3000, function() {

	var host = server.address().address
	var port = server.address().port

	console.log('App listening at http://%s:%s', host, port)

})

/**
 * geocoding wrapper
 */


  var SunlightClient = require('sunlight').SunlightClient;
  var fs    = require('fs'),
  nconf = require('nconf');
 
var urlencode = require('urlencode');

nconf.file('./sender/apidata.json');



var getSubscriberReps = function(subscriber, renderFn) {
	var lat;
	var long;
	var geocoderProvider = 'google';
	var httpAdapter = 'https';	
	var myKey = nconf.get('google:geoapikey')
	var extra = {
	    apiKey: myKey, 
	    formatter: null
	};
	var geocoder = require('node-geocoder').getGeocoder(geocoderProvider, httpAdapter, extra);

	geocoder.geocode({address: subscriber.address, city: subscriber.city, country: 'USA', zipcode: subscriber.zipcode}, function(err, res) {
	
	    for (r in res) {
		
			long = res[r].longitude;
			lat = res[r].latitude;
	    }
	    var sunlightApiKey = nconf.get('sunlight:apikey')
	    var sunlight = new SunlightClient(sunlightApiKey);
	    sunlight.legislators.allForLatLong(lat, long, function(legs) {
	    	for (leg in legs) {
	    		if(legs[leg].district.indexOf(' ') <= 0){
				    
				    subscriber.district = legs[leg].district;
				}
			 
	       
	    	}
	    	subscriber.lat = lat;
	    	subscriber.long = long;
	    	renderFn(subscriber, legs);
	    });
    });
}

var getSubscriberDistrict = function(lat, long, renderFn) {
	// get district for an address: districtsLocate()
	sunlight_api.districtsLocate().call(function(data) {
		
	});
	renderFn();
}



var geocodeAddressB = function(address, city, zipcode){
	
	var add = urlencode(address + ' ' + city + ' ' + zipcode);
	var uri = 'http://maps.googleapis.com/maps/api/geocode/json?address=' + add + '&sensor=false';
	
	
	var options = {
			  host: 'maps.googleapis.com',
			  port: 80,
			  path: uri,
			  method: 'GET'
			};

			var req = http.request(options, function(res) {
			  console.log('STATUS: ' + res.statusCode);
			  console.log('HEADERS: ' + JSON.stringify(res.headers));
			  res.setEncoding('utf8');
			  res.on('data', function (chunk) {
			    console.log('BODY: ' + chunk);
			  });
			});
}

exports.getSubscriberDistrict = getSubscriberDistrict
exports.getSubscriberReps = getSubscriberReps
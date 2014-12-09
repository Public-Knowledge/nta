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
	console.log(subscriber.address, subscriber.city, subscriber.zipcode);
	
	geocoder.geocode({address: subscriber.address, city: subscriber.city, country: 'USA', zipcode: subscriber.zipcode}, function(err, res) {
	    console.log(res);
	    for (r in res) {
		
			long = res[r].longitude;
			lat = res[r].latitude;
	    }
	    var sunlightApiKey = nconf.get('sunlight:apikey')
	    var sunlight = new SunlightClient(sunlightApiKey);
	    sunlight.legislators.allForLatLong(lat, long, function(legs) {
	    	for (leg in legs) {
	    		if(legs[leg].district.indexOf(' ') <= 0){
				    console.log("Store district", legs[leg].district);
				    subscriber.district = legs[leg].district;
				}
			 
	        console.log(legs[leg].district + ' ' + legs[leg].firstname + ' ' + legs[leg].lastname);  
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
		console.log(data.results.length);
	});
	renderFn();
}


var geocodeAddress = function(address, city, zipcode){
//	var long = "-74.071380";
//	var lat = "40.686620";
//	return [lat, long]
	//https://maps.googleapis.com/maps/api/geocode/json?parameters
	

}


var geocodeAddressB = function(address, city, zipcode){
	
	var add = urlencode(address + ' ' + city + ' ' + zipcode);
	var uri = 'http://maps.googleapis.com/maps/api/geocode/json?address=' + add + '&sensor=false';
	console.log(uri);
	
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

exports.geocodeAddress = geocodeAddress;
exports.getSubscriberDistrict = getSubscriberDistrict
exports.getSubscriberReps = getSubscriberReps
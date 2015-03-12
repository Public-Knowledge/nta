/**
 * geocoding wrapper
 */


  var SunlightClient = require('sunlight').SunlightClient;
  var api = require("sunlight-congress-api");
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
		var api = require("sunlight-congress-api");
		
		var sunlightApiKey = nconf.get('sunlight:apikey');
		console.log("sunlight key is ", sunlightApiKey);
		console.log("lat - long:", lat, long);
		api.init(sunlightApiKey);
		api.legislatorsLocate().explain();
		
		console.log(api);
		
		//https://congress.api.sunlightfoundation.com/legislators/locate?apikey=e595c253eb19468c9f12d743f77226f1&latitude=38.8812813&longitude=-77.1096712
		
		api.legislatorsLocate().fields("district", "district");
	   
	   	api.legislatorsLocate().filter("latitude", lat).filter("longitude", long).call(function(data){ 
	   
   			 console.log(data.results.length);
  			 for (leg in data.results) {
  			 	//console.log("rep: ", data.results[leg]);
  			 	//console.log("district: ", data.results[leg].district);
  				if (data.results[leg].district){
  				
	    			 subscriber.district = data.results[leg].district;
	    			 console.log("set district to ", subscriber.district);
	    		 }
	    	}
	    	subscriber.lat = lat;
	    	subscriber.long = long;
	    	renderFn(subscriber, data.results);
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
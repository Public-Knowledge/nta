/**
 * geocoding wrapper
 */

  var SunlightClient = require('sunlight').SunlightClient;

  
//var sunlight_api = require("sunlight-congress-api");
//sunlight_api.init("e595c253eb19468c9f12d743f77226f1");

var urlencode = require('urlencode');




var getSubscriberReps = function(subscriber, renderFn) {
	
	var geo = geocodeAddress(subscriber.address, subscriber.city, subscriber.zipcode);
	var lat = geo[0];
	var long = geo[1];
	
	var sunlight = new SunlightClient("e595c253eb19468c9f12d743f77226f1");
    
	sunlight.legislators.allForLatLong(geo[0], geo[1], function(legs) {
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
 
}

var getSubscriberDistrict = function(lat, long, renderFn) {
	// get district for an address: districtsLocate()
	sunlight_api.districtsLocate().call(function(data) {
		console.log(data.results.length);
	});
	renderFn();
}


var geocodeAddress = function(address, city, zipcode){
	var long = "-74.071380";
	var lat = "40.686620";
	return [lat, long]

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

var geocodeAddressA = function(address, city, zipcode, renderFn){
	
	


//https://www.npmjs.org/package/node-geocoder
	var geocoderProvider = 'google';
	var httpAdapter = 'http';
	// optionnal
	var extra = {
	    apiKey: 'YOUR_API_KEY', // for Mapquest, OpenCage, Google Premier
	    formatter: null         // 'gpx', 'string', ...
	};

	var geocoder = require('node-geocoder').getGeocoder(geocoderProvider, httpAdapter, extra);

	var success = function(data) {
		console.log(data);
	}	

}

exports.geocodeAddress = geocodeAddress;
exports.getSubscriberDistrict = getSubscriberDistrict
exports.getSubscriberReps = getSubscriberReps
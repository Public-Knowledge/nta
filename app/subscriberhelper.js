/**
 * MySQL queries
 */

var mysql = require('mysql');
var connection = mysql.createConnection({
	host : 'localhost',
	user : 'txtapp',
	password : 'RKFDVrFFf2FRGwtC',
	database : 'txtapp'
});

// connection.connect();

// connection.query('select sms from alert where id=9', function(err, rows,
// fields) {
// if (err) throw err;
// console.log('selected: ', rows[0]);
// });

// connection.end();

var listSubscribers = function(renderFn) {

	connection
			.query(
					'select * from subscriber',
					function(err, rows) {
						if (err)
							throw err;
						console.log(rows);
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


var addSubscriber = function(subscriber, renderFn) {

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
		connection.escape(subscriber.lat) + ',' +
		connection.escape(subscriber.long) + ',' +
		connection.escape(subscriber.district) + ',' +
		connection.escape(subscriber.status) +')';

	console.log(sql);

	connection.query(sql, function(err, rows) {
		if (err)
			throw err;
		renderFn(subscriber);
	});
}



exports.listSubscribers = listSubscribers;
exports.getSubscriberByNumber = getSubscriberByNumber;
exports.getSubscriberById = getSubscriberById;
exports.updateSubscriber = updateSubscriber;
exports.addSubscriber = addSubscriber;

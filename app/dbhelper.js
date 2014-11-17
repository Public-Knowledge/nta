/**
 * MySQL queries
 */

var mysql = require('mysql');
var connection = mysql.createConnection({
	host : 'localhost',
	user : 'txtapp',
	password : 'RKFDVrFFf2FRGwtC',
	database : 'txtapp',
	multipleStatements: true
});

// connection.connect();

// connection.query('select sms from alert where id=9', function(err, rows,
// fields) {
// if (err) throw err;
// console.log('selected: ', rows[0]);
// });

// connection.end();

var listCampaigns = function(renderFn) {
	// connection.connect();
	connection
			.query(
					'select sms,id,send,status,connectCustom,connectCustomTitle from alert',
					function(err, rows) {
						if (err)
							throw err;

						// return rows;
						for (r in rows) {
							utcSeconds = rows[r].send;
							var d = new Date(utcSeconds * 1000)
							rows[r].send = d;
						}
						renderFn(rows);
					});

	// connection.end();

}
var getCampaign = function(campaign_id, renderFn) {

	var sql = 'SELECT * FROM alert WHERE id = '
			+ connection.escape(campaign_id);
	console.log(sql);
	connection.query(sql, function(err, rows) {
		if (err)
			throw err;
		// return rows;
		for (r in rows) {
			utcSeconds = rows[r].send;
			var d = new Date(utcSeconds * 1000);
			var year = d.getFullYear();
			
			var month = d.getMonth();
			console.log("got month: ", month);
			
			var dateOfMonth = d.getDate();
			var hours = d.getHours();
			var minutes = d.getMinutes();

			rows[r].day = month + "/" + dateOfMonth + "/" + year;
			rows[r].time = hours + ":" + minutes;
			rows[r].send = d;
		}

		renderFn(rows);
	});

}



var getCampaignWithTargets = function(campaign_id, renderFn) {
	var campaign = {
			id: campaign_id,
			targets: []
	}
	var sql = 'select * from alert a, campaign_target_sets ct, target_sets t where a.`id` = ct.`alert_id` and t.`id` = ct.`target_set_id` and a.`id` ='
			+ connection.escape(campaign_id);
	console.log(sql);
	connection.query(sql, function(err, rows) {
		if (err)
			throw err;
		// return rows;
		for (r in rows) {
			utcSeconds = rows[r].send;
			var d = new Date(utcSeconds * 1000);
			var year = d.getFullYear();
			//month is zero indexed
			var month = d.getMonth() + 1;
			var dateOfMonth = d.getDate();

			var hours = d.getHours();
			var minutes = d.getMinutes();

			campaign.day = month + "/" + dateOfMonth + "/" + year;
			campaign.time = hours + ":" + minutes;
		
			campaign.send = d;
			campaign.sms = rows[r].sms;
			campaign.connectSenior = rows[r].connectSenior;
			campaign.connectJunior = rows[r].connectJunior;
			campaign.connectRepresentative = rows[r].connectRepresentative;
			campaign.status = rows[r].status;
			campaign.connectCustom = rows[r].connectCustom;
			campaign.connectCustomTitle = rows[r].connectCustomTitle;
			campaign.mp3_file_location = rows[r].mp3_file_location;
			campaign.targets.push(rows[r].geo_target);
			 
			}
		console.log(campaign);
		renderFn(campaign);
	});

}

var addCampaign = function(campaign, renderFn) {

	var sql = 'insert into alert (sms, send, connectCustom, connectCustomTitle, mp3_file_location) ' +
	'values (' +
	connection.escape(campaign.sms) + ',' +
	connection.escape(campaign.dateInEpoch) + ',' +
	connection.escape(campaign.connectCustom) + ',' +
	connection.escape(campaign.connectCustomTitle) + ',' +
	connection.escape(campaign.mp3_file_location) +')';
	console.log(sql);

	connection.query(sql, function(err, result) {
		if (err)
			throw err;
		console.log(result.insertId);
		campaign.id=result.insertId;
		campaign.targets= [];
		
		var target_sql = 'insert into target_sets (rep_id, geo_target) values ';
		for  (state in campaign.target) { 
			//hack, set to 1 for senate/rep type right now
			target_sql = target_sql + '(1, '+ connection.escape(state) + '),';
		 }
		//take off trailing comma
		 var len = target_sql.length;
		target_sql = target_sql.substring(0,len-1);
		
		console.log(target_sql);
		
		connection.query(target_sql, function(err, tResult) {
			if (err)
				throw err;
			console.log(tResult.insertId);
			campaign.targetId = tResult.insertId;
			var target2_sql = 'insert into campaign_target_sets (alert_id, target_set_id) values (' +
			
			connection.escape(campaign.id) + ',' + 
			 connection.escape(campaign.targetId) +
			')';
			console.log(target2_sql);
			
			connection.query(target2_sql, function(err, tcResult) {
				if (err)
					throw err;
				campaign.targets.push(campaign.target);
				console.log(campaign);
				renderFn(campaign);
			});
		});
	});
}

var updateCampaign = function(campaign, renderFn) {

	campaign.targets= [];
	var sql = 'update alert set send=' + connection.escape(campaign.dateInEpoch)
			+ ', connectCustomTitle =' + connection.escape(campaign.connectCustomTitle)
			+ ', sms=' + connection.escape(campaign.sms) +', mp3_file_location=' + connection.escape(campaign.mp3File)
			+ ' where id='
			+ connection.escape(campaign.id);

	console.log(sql);

	connection.query(sql, function(err, rows) {
		if (err)
			throw err;
		console.log(campaign);
		
		getCampaignWithTargets(campaign.id, renderFn);
	});		
	
}

//to do - make this all a transaction http://dev.mysql.com/doc/refman/5.1/en/commit.html

var updateCampaignTargetsFirst= function(campaign,  renderFnB) {
	console.log("function b: " + renderFnB);
	var sql = 'delete from campaign_target_sets where alert_id = ' + connection.escape(campaign.id);
	console.log(sql);
	connection.query(sql, function(err, result) {
		if (err) throw err;
		updateCampaignTargets(campaign, renderFnB);
		
	});
	
}

var updateCampaignTargets = function(campaign, renderFn) {
	console.log("entering update campaign targets");
	var index;
	var states = "";
	var update_targets_sql = "";
	//target is either a single string, if 1 checkbox was checked, or an array. 
	if ((typeof campaign.targets) == 'object'){
		console.log("object");
		//put quotes around items
		for (index = 0; index < campaign.targets.length; ++index) {
			console.log(campaign.targets[index]);
			campaign.targets[index] = '"' + campaign.targets[index] + '"';
		}
		states = campaign.targets.join(",");
	}else{
		//single state sent
		states =  '"' + campaign.targets + '"';
	}
	console.log("states is " + states);


	
	var target_id_sql = 'select id from target_sets where rep_id = 1 and geo_target in (' + states +')';
		connection.query(target_id_sql, function(err, target_set_results) {
				if (err)
					throw err;
				console.log(target_set_results);
				for (r in target_set_results) {
					tsid = target_set_results[r].id;
					
					console.log("target set ID " + tsid);
					update_targets_sql += "(" + connection.escape(campaign.id) + ", " + tsid + "),"
					
				}
				//strip trailing comma
				 var len = update_targets_sql.length;
				update_targets_sql = update_targets_sql.substring(0,len-1);
				console.log(update_targets_sql);
				
				//insert into campaign_target_sets
				var insertsql = 'insert into campaign_target_sets (alert_id, target_set_id) values ' +
				update_targets_sql;
					
				console.log(insertsql);
					
				connection.query(insertsql, function(err, inserted_results) {
						if (err)
							throw err;
							renderFn(campaign);
					});	

				
			});
}
	
var getCampaignTargets = function(campaign_id, renderFn) {

	var campaign = {
			id: campaign_id,
			targets: [] }
	 
	var sql = 'select * from alert a, campaign_target_sets ct, target_sets t where a.`id` = ct.`alert_id` and t.`id` = ct.`target_set_id` and a.`id` ='
			+ connection.escape(campaign_id);
	console.log(sql);
	connection.query(sql, function(err, rows) {
		if (err)
			throw err;
		
		for (r in rows) {
			
			campaign.sms = rows[r].sms;
			campaign.connectSenior = rows[r].connectSenior;
			campaign.connectJunior = rows[r].connectJunior;
			campaign.connectRepresentative = rows[r].connectRepresentative;
			
			campaign.targets.push(rows[r].geo_target);
			 
			}
		console.log(campaign);
		renderFn(campaign);
	});			
}

exports.updateCampaignTargetsFirst = updateCampaignTargetsFirst;
exports.updateCampaignTargets = updateCampaignTargets;
exports.getCampaignTargets = getCampaignTargets;
exports.addCampaign = addCampaign;
exports.getCampaignWithTargets = getCampaignWithTargets;
exports.listCampaigns = listCampaigns;
exports.getCampaign = getCampaign;
exports.updateCampaign = updateCampaign;

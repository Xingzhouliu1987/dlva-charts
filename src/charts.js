var airtable = require("airtable") ;

module.exports = function(apiKey, baseid, verificationToken) {
	airtable.configure({
		apiKey: apiKey
	})
	var  base = airtable.base(baseid);

	/*
		Calls Airtable API to get charts url for airport
	*/
	function get_chart(airport, callback) {
	    var results;
		base('SID/STAR Charts').select({
		    // Selecting the first 3 records in Grid view:
		    maxRecords: 1,
		    view: "Grid view",
		    filterByFormula : "{Airport} = '"+airport+"'"
		}).eachPage(function page(records, fetchNextPage) {
		    if(records.length === 0) {
		    	results = "Charts for airport "+airport+" not found."
		    } else {
			    records.forEach(function(record) {
			        results = record.get('Charts');
			    });
			}
		    // To fetch the next page of records, call `fetchNextPage`.
		    // If there are more records, `page` will get called again.
		    // If there are no more records, `done` will get called.
		    fetchNextPage();

		}, function done(err) {

		    if (err) { 
		    	callback("Sorry, somethings broken :-(")
		    } else {
		    	callback(results)
		    }
		});
	};
	var check;
	if(verificationToken) {
		check = function(req) {
			return req.body.token === verificationToken
		}
	}
	else 
	{
		check = function(req) {
			return true;
		}
	}
    return function(req,res){

		var airport = req.body.text ;
		if(!check(req)) {
				res.setHeader('Content-Type', 'application/json');
				res.send(JSON.stringify({
					"response_type"  : "ephemeral" , 
					"text" : "Invalid Command" ,
				}));		
				return ;	
		}
		if(airport && typeof(airport) === "string" && (airport = airport.trim().toUpperCase()).length === 4 ) {
			/*
				Airport code is required to be a four letter character string
			*/
			get_chart(airport, function(result){
				res.setHeader('Content-Type', 'application/json');
				res.send(JSON.stringify({
					"response_type"  : "ephemeral" , 
					"text" : "Charts for " + airport ,
					"attachments" : [
						{"text" : result }
					]
				}));

			})
		}
		else {
			/*
				Airport code provided is not valid
			*/
			res.setHeader('Content-Type', 'application/json');
			res.send(JSON.stringify({
				"response_type"  : "ephemeral" , 
				"text" : "Charts command expects a 4 letter airport code",
				"attachments" : [
					{"text" : "Airport code " + airport + " does not pass the sniff test" }
				]
			}));
		}
	}
};
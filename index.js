
var airtable = require("airtable") , 
	express = require("express") , 
	bodyParser = require("body-parser");

airtable.configure({
	apiKey: "key9rX4SfkIdPvMjd"
})
var  base = airtable.base('appiOTKmVcjI5OBZ6');

/*
	Calls Airtable API to get charts for airport
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
var app = express();


app.post("/",bodyParser.urlencoded(),function(req,res){

	var airport = req.body.text ;
	if(airport && typeof(airport) == "string" && (airport = airport.trim()).length ===4 ) {
		get_chart(airport.toUpperCase(), function(result){
			res.setHeader('Content-Type', 'application/json');
			res.send(JSON.stringify({
				"response_type"  : "ephemeral" , 
				"text" : "Charts for " + airport.toUpperCase() ,
				"attachments" : [
					{"text" : result }
				]
			}));

		})
	}
	else {
		res.setHeader('Content-Type', 'application/json');
		res.send(JSON.stringify({
			"response_type"  : "ephemeral" , 
			"text" : "Charts command expects a 4 letter airport code",
			"attachments" : [
				{"text" : airport + " does not pass the sniff test" }
			]
		}));
	}
})

app.listen(9999)
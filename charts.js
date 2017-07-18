var airtable = require("airtable") ;

module.exports = function(apiKey, baseid) {
	airtable.configure({
		apiKey: apiKey
	})
	var  base = airtable.base(baseid);

	/*
		Calls Airtable API to get charts url for airport
	*/
	return function (airport, callback) {
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
};
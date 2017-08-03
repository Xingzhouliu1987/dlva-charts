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
	    var results = {} ;
		base('SID/STAR Charts').select({
		    // Selecting the first 3 records in Grid view:
		    maxRecords: 1,
		    view: "Grid view",
		    filterByFormula : "{Airport} = '"+airport+"'"
		}).eachPage(function page(records, fetchNextPage) {
		    if(records.length === 0) {
		    	results.text = "Charts for airport "+airport+" not found."
		    	results.err = 1;
		    } else {
			    records.forEach(function(record) {
			        results.chart_url = record.get('Charts');
                    var chartarray = record.get('Airport Layout Charts (If available)')
                    console.log(JSON.stringify(record.fields))
                    if(chartarray && chartarray.length > 0) {
                    	results.layouts = chartarray.map(function(d){return d.url;});
                    }
                    results.smallgates = record.get('Small Aircraft Delta Gates (B739 and Smaller)')
                    results.biggates = record.get('Large Aircraft Delta Gates (B752 and Larger)')
			    });
			    results.text = "Charts for " + airport 
			}
		    // To fetch the next page of records, call `fetchNextPage`.
		    // If there are more records, `page` will get called again.
		    // If there are no more records, `done` will get called.
		    fetchNextPage();

		}, function done(err) {

		    if (err) { 
		    	callback({text:"Sorry, somethings broken :-(", err : 1})
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
				var output = {"response_type": "ephemeral", 
			                  "attachments" : []}
			    var attachment = {
                     title : "Charts and Airport Information",
                     text : result.text ,
                     fields : []
			    }			                  
			    if(result.err==null) {
                    if(result.layouts) {
                    	attachment.image_url = result.layouts[0];
                    }
			    	if(result.chart_url) {
			    		attachment.fields.push({"title":"Charts","value":result.chart_url})
			    	}
			    	attachment.fields.push({"title":"Small Aircraft Delta Gates (B739 and Smaller)","value":result.smallgates})
			    	attachment.fields.push({"title":"Large Aircraft Delta Gates (B752 and Larger)","value":result.biggates})
			    	
			    }
			    output.attachments = [attachment]
			    if(result.layouts && result.layouts.length > 1) {
			    	output.attachments = output.attachments.concat( result.layouts.slice(1).map(function(d){

                               return {"title":"", "image_url":d }
			    	}))
			    }
				res.send(JSON.stringify(
					output
				));

			})
		}
		else {
			/*
				Airport code provided is not valid
			*/
			res.setHeader('Content-Type', 'application/json');

				var output = {"response_type": "ephemeral", 
			                  "attachments" : []}
			    var attachment = {
                     title : "Charts and Airport Information",
                     text : "Charts command expects a 4 letter airport code"
                }
                output.attachments = [attachment]

			res.send(JSON.stringify(output));
		}
	}
};

var xml2js = require("xml2js") ,
 	querystring = require("querystring") , 
 	geturl = require("simple-get") ;

function asArray(obj) {
	if(Array.isArray(obj)) return obj;
	return [obj];
}
function extend(a,b) {
	for(var nm in b) {
		a[nm] = b[nm]
	}
	return a;
}
function request_metar(airport, callback, options) {
	var result = '' ,
		currtime , 
		defaultopts = extend({
			dataSource: "metars",
			requestType : "retrieve",
			hoursBeforeNow : 2 , 
			format : "xml" , 
			stationString : airport.toUpperCase()
		}, options || {}),
		parser = new xml2js.Parser();

	var query_string = querystring.stringify(defaultopts)

	geturl({
		url : "https://www.aviationweather.gov/adds/dataserver_current/httpparam?" + query_string,
		method : "get"
	}, function(err,res) {
		if(err) {
			callback(err, null)
			return
		}
		res.on("data",function(chunk){
			result += chunk;
		})
		res.on("end",function(){
			parser.parseString(result, callback)
		})
	})

}

function metar(airport, callback) {
	if(airport && typeof(airport) === "string" && (airport = airport.trim().toUpperCase()).length === 4) {
		request_metar(airport, function(err,result) {
			if(err) {
				callback({
						response_type: "ephemeral",
						text: "Something Broke :-(. Sorry!"
				})
			} else {

				if(result.response.data[0].METAR === undefined || result.response.data[0].METAR === null || result.response.data[0].METAR.length === 0) {
					callback({
							response_type: "ephemeral",
							text: "No weather available for " + airport
					})
					return;
				} else {
					callback({
							response_type: "ephemeral",
							text: "METAR for "+airport+" at " + new Date(),
							attachments : result.response.data[0].METAR.map(function(d){
									return { text : 
										(new Date(d.observation_time)) + " -> " + d.raw_text	
									}	
							})

					  })				
				}
			}


		})
	} else {
		callback({
				"response_type"  : "ephemeral" , 
				"text" : "Charts command expects a 4 letter airport code",
				"attachments" : [
					{"text" : "Airport code " + airport + " does not pass the sniff test" }
				]
		})
	}
}
module.exports = function(verificationToken,callback,options) {
	var check = function() {
		return true;
	}
	if(verificationToken) {
		check = function(req) {
			return req.body.token === verificationToken;
		}
	}
	return function(req, res) {
		var airport = req.body.text ;
		if(!check(req)) {
			res.setHeader('Content-Type', 'application/json');
			res.send(JSON.stringify({
				response_type: "ephemeral" , 
				text: "Invalid Command"
			}))			
			return;
		}
		metar(airport , function(result){
			res.setHeader('Content-Type', 'application/json');
			res.send(JSON.stringify(result))
		},options)
	}
}

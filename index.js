
var charts = require("./charts.js") , 
	express = require("express") , 
	bodyParser = require("body-parser") , 
	env = require("./env.js") ;

console.log(env)
var get_chart = charts(env.apiKey, env.baseid);

var app = express();

app.set('port', (process.env.PORT || process.argv[2] || 5000))

app.post("/charts",bodyParser.urlencoded(),function(req,res){

	var airport = req.body.text ;
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
				{"text" : "Airport code" + airport + " does not pass the sniff test" }
			]
		}));
	}
})

app.get("/",function(req,res){
	res.setHeader('Content-Type', 'application/json');
	res.send(JSON.stringify({
			"response_type"  : "ephemeral" , 
			"text" : "invalid request"
	}));
});

app.listen(app.get("port"), function(){
	console.log("serving on "+app.get("port"))
})
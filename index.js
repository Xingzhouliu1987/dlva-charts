
var charts = require("./src/charts/charts.js") , 
	metars = require("./src/metar/metar.js") ,
	express = require("express") , 
	bodyParser = require("body-parser") , 
	env = require("./env.js") ,
	googlesheets = require("./src/googlesheets/googlesheets.js");
console.log(env)

var app = express();

app.set('port', (process.env.PORT || process.argv[2] || 5000))

app.post("/charts",bodyParser.urlencoded(),charts(env.apiKey, env.baseid, env.verificationToken))
app.post("/metar",bodyParser.urlencoded(),metars(env.verificationToken))


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
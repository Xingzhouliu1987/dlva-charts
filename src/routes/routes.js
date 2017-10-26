
var getSheet = require("../googlesheets/googlesheets.js"),
	fuzzy = require("fuzzyset");
var re = /(?:^(.+)(?:(?:\s+to\s+)|(?:\s*-\s*))(.+)$)|(?:^([\w\d]+)\s+([\w\d^\-]+)$)/i

function parseInput(input) {
	var matched = re.exec(input)
	if(matched === null) {
		return [input, null]
	} else {
		return [matched[1].trim() || matched[3].trim(), matched[2].trim() || matched[4].trim()]
	}
}

var routes = undefined ,
	full_names = [] ,
	hubs = [] ,
	names = {} ,
	searcher = fuzzy();

function ingest(api_key,doc_id,range) {
	return function(callback) {
	return getSheet.noAuth(api_key,doc_id,range)(function(err,res){
		if(err) {
			////console.log(err)
		}
		////console.log(res)
		var rts = [],
			nms = {},
			nms_match = [],
			j = 0 ,
			hbs = null;
		for(var i = 0; i<res.length; i++) {
			var dt_code = res[i][4],
				city_name = res[i][10],
				state_country_name = res[i][11] == "-" ? res[i][12] : res[i][11],
				airport_name = res[i][13],
				iata = res[i][16];
			if(nms[dt_code]==null) {
				nms[(city_name + ", " + state_country_name + " ("+dt_code+" - "+airport_name+") ")] = j;
				nms[dt_code] = j;
				nms[iata] = j;
				nms[airport_name] = j;
				nms_match[j] = (city_name + ", " + state_country_name + " ("+dt_code+" - "+airport_name+") ");
				searcher.add((city_name + ", " + state_country_name + " ("+dt_code+" - "+airport_name+") "))
				searcher.add(iata)
				searcher.add(dt_code)
				searcher.add(airport_name)
				j += 1
			}
		}
		rts = {};
		hbs = new Array(j+1).fill(false)
		for(var i = 0; i<res.length; i++) {
			if(res[i][0]=="ACTIVE") {
				var hub = nms[res[i][3]], 
					dest = nms[res[i][4]];
				hbs[hub] = true;
				if(rts[hub]) {
					rts[hub][dest] = res[i]
				} else {
					rts[hub] = {}
					rts[hub][dest] = res[i]
				}
				if(rts[dest]==null) {
					rts[dest] = {}
				}
				res[i].push(full_names[hub] + " to " + full_names[dest])
			}
		}
		hubs = hbs;
		names = nms;
		full_names = nms_match;
		routes = rts;
		callback(routes)
	})

	}

}
function airport_not_found(text,res) {
		res.setHeader('Content-Type', 'application/json');
		res.send(JSON.stringify({
			"response_type"  : "ephemeral" , 
			"text" : "Airport " + text + " could not be found." ,
		}));		

}
function route_not_found(text,res) {
		res.setHeader('Content-Type', 'application/json');
		res.send(JSON.stringify({
			"response_type"  : "ephemeral" , 
			"text" : "Route " + text + " could not be found." ,
		}));		

}

function get_route(api_key,doc_id,range,verificationToken) {
	var check,
		ingestor = ingest(api_key,doc_id,range);
	
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
	var callfunc = function (req,res) {

		if(!check(req)) {
				res.setHeader('Content-Type', 'application/json');
				res.send(JSON.stringify({
					"response_type"  : "ephemeral" , 
					"text" : "Invalid Command" ,
				}));		
				return ;	
		}	
		if(req.body.text=="update-routes-1648") {
			return ingestor(function(){
				res.setHeader('Content-Type', 'application/json');
				res.send(JSON.stringify({
					"response_type"  : "ephemeral" , 
					"text" : "Updated" ,
				}));
			})			
		}	
		if(routes == undefined) {
			return ingestor(function(){
				return callfunc(req,res)
			})
		}
		var args = parseInput(req.body.text),	
			depart = args[0],
			arrive = args[1];
		////console.log(args)
		if(arrive == null || depart == null) {
			return route_not_found(req.body.text,res)
		}
		var dpt = names[depart] ,
			arv = names[arrive] ,
			route = null;
		////console.log(searcher.get(depart))
		if(dpt == null) {
			dpt = names[searcher.get(depart)[0][1]]
		}
		if(arv == null) {
			arv = names[searcher.get(arrive)[0][1]]
		}
		if(dpt == null) {
			return airport_not_found(depart,res)
		}
		if(arv == null) {
			return airport_not_found(arrive,res)
		}

		route = routes[dpt][arv] || routes[arv][dpt]
		if(route==null) return route_not_found(req.body.text,res)
		res.setHeader('Content-Type', 'application/json');
		var output = 
			{"response_type": "ephemeral", 
 				
	                  "attachments" : [  {
				"title": "Route Information for" ,
				"text" : req.body.text,
				"fields": [     
				{
                    "title": "Flight",
                    "value": route[2],
					"short" : true
					
                },
				{
                    "title": "Code Share",
                    "value": route[9],
					"short" : true
                },
				{
                    "title": "Departing",
                    "value": full_names[dpt] ,
                    "short": true
                },
                {
                    "title": "Arriving",
                    "value": full_names[arv],
                    "short": true
                },
				{
					"title" : "Duration",
					"value" : route[8],
					"short" : true
				},
				{"title":"Domestic/International" , "value" : route[14],"short" : true},						
				{"title":"Route Type" ,"value": route[6],"short":true},
				{"title":"Distance" ,"value": route[7],"short":true},
				{"title":"Aircraft" ,"value": route[5],"short":true},
				{"title":"Flight Information","value":"http://flightaware.com/live/findflight?origin="+route[3]+"&destination=" + route[4],"short":true}
				]}
				]}	
			res.send(JSON.stringify(
					output
			))                  

	}
	return callfunc
}
get_route.ingest = ingest
module.exports = get_route;
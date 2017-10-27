
var getSheet = require("../googlesheets/googlesheets.js"),
	fuzzyset = require("fuzzyset") ;
	//|(?:^([\w\d]+)\s+([\w\d^\-]+)$)
var re = /(?:^(.+)(?:(?:\s+to\s+)|(?:\s*-\s*))(.+)$)/i
var fullTextSearch = require('full-text-search');
var searchidx = new fullTextSearch();
function parseInput(input) {
	var matched = re.exec(input)
	if(matched === null) {
		return [input, null]
	} else {
		return [matched[1].trim() , matched[2].trim()]
	}
}

function dot_path(object,path) {
	var segments = path.split("."),
		res = object; 
	while(segments.length) {
		if(res==null) {
			return null;
		}
		res = res[segments.shift()]

	}
	return res;
}

// function searchercls(heap_in, search_fields) {
// 	var match = {} , 
// 		strings = [] , 
// 		fuzzy = fuzzyset() ,
// 		obj = {} ,
// 		heap = [];

// 	obj.add = function(heap_object) {
// 		for(var j = 0; j<search_fields.length; j++) {
// 			var val = dot_path(heap_object,search_fields[j]);
// 			//console.log(val)
// 			if(match[val] == null) {
// 				match[val] = []
// 				fuzzy.add(val)
// 			}
// 			if(match[val].indexOf(heap.length) < 0) {
// 				match[val].push(heap.length)
// 			}
// 			heap.push(heap_obj)
// 		}		
// 	}
// 	for(var i = 0; i<heap.length; i++) {
// 		obj.add(heap_in[i])
// 	}
// 	obj.search = function(search_string,n) {
// 		var weights = {} , 
// 			results = [] ,
// 			raw = fuzzy.get(search_string) ;
// 		//console.log("Search for: "+search_string)
// 		//console.log(fuzzy.get("Los Angeles"))
// 		//console.log(raw)
// 		raw.map(function(match){
// 			var wgt = match[0],
// 				val = match[1],
// 				nw = [];
// 				for(var i = 0; i<match[val].length; i++) {
// 					var idx  = match[val][i];
// 					if(weights[idx]) {
// 						weights[idx] += wgt;
// 					} else {
// 						weights[idx] = wgt;
// 						nw.push(idx)
// 					}
// 				}
// 				results.concat(nw)
// 		})
// 		results.sort(function(a,b){
// 			return weights[b] - weights[a]
// 		})
// 		if(n) {
// 			return results.map(function(x){
// 				return heap[x]
// 			}).slice(0,n)
// 		}
// 		return results.map(function(x){
// 			return heap[x]
// 		});
// 	}
// 	return obj
// }

var routes = undefined ,
	airports = [] ,
	bycode = {} ,
	searcher ;

function ingest(api_key,doc_id,range) {
	return function(callback) {
	return getSheet.noAuth(api_key,doc_id,range)(function(err,res){
		if(err) {
			//////console.log(err)
		}
		//////console.log(res)
		var rts = {},
			apts = [],
			proced = {},
			j = 0 ,
			hbs = {} ;
		for(var i = 0; i<res.length; i++) {
			var dt_code = res[i][4],
				city_name = res[i][10],
				state_country_name = res[i][11] == "-" ? res[i][12] : res[i][11],
				airport_name = res[i][13],
				iata = res[i][16];


			if(proced[dt_code]==null) {
				var fn = ( city_name + " " + airport_name + " ("+dt_code+")" ), 
					apt ;
				apts.push(apt = {"code": dt_code, "city" : city_name , 
							"state_or_country" : state_country_name,
							"full_name" :  fn , 
							"city_full" : city_name + " " + state_country_name, 
							"name" : airport_name , "id" : apts.length })
				searchidx.add(apt)
				proced[dt_code] = apt.id
			}
			hbs[res[i][3]] = true
		}		
		for(var i = 0; i<apts.length; i++) {
			apts[i].hub = false
			if(hbs[apts[i].code]) {
				apts[i].hub = true
			}

		}
		for(var i = 0; i<res.length; i++) {
			if(res[i][0]=="ACTIVE") {
				var src = proced[res[i][3]],
					dest = proced[res[i][4]];
				if(rts[src]==null) {
					rts[src] = {}
				}
				rts[src][dest] = res[i]; 
				if(rts[dest]==null) {
					rts[dest] = {}
				}				
			}
		}
		bycode = proced;
		airports = apts;
		routes = rts;
		searcher = searchidx;
		callback(routes,airports)
	})

	}
}

function process_search_routes(potentials_x,potentials_y) {
	var output = [] ,
		weight = [] ,
	 	order = [] ,
	 	uniquify = {} ; 
	potentials_x = potentials_x.slice(0,4)
	potentials_y = potentials_y.slice(0,4)
	for(var i = 0; i<potentials_x.length; i++) {
		for(var j = 0; j<potentials_y.length; j++) {
			var cands = routes[potentials_x[i].id],
				cand = cands == null ? null : cands[potentials_y[j].id]
			if(cand == null) {
				cands = routes[potentials_y[j].id]
				cand = cands == null ? null : cands[potentials_x[i].id]
			}
			if(cand != null && uniquify[cand[3]+"-"+cand[4]] == null) {
				output.push(cand)
				weight.push(i + j)
				order.push(order.length)
				uniquify[cand[3]+"-"+cand[4]] = true;
			}
		}
	}
	return order.sort(function(i,j){
		return weight[i] - weight[j]
	}).map(function(i_ordered){
		return output[i_ordered]
	})
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
function invalid_search(text,res) {
		res.setHeader('Content-Type', 'application/json');
		res.send(JSON.stringify({
			"response_type"  : "ephemeral" , 
			"text" : "Search " + text + " is not valid." ,
		}));		
}
function routes_from_list(req, res, routez,fromap, attach) {
		res.setHeader('Content-Type', 'application/json');
		var output = 
			{
				   "response_type": "ephemeral", 
 					"text" : "Routes starting from " + (fromap || {}).full_name,
	                  "attachments" : [ ]
			}	
		for(routeid in routez) {
			var route = routez[routeid];
			var toap = airports[bycode[route[4].trim().toUpperCase()]],
				fname = (toap || {}).full_name,
				fltnm = route[2],
				pln = route[5],
				typ = route[6],
				dist = route[7],
				duration = route[8];
			output.attachments.push({
				"title" : fltnm,
				"text" : fname,
				"fields":[
					{
						"title" : "Duration/Distance",
						"value" : duration + " ("+dist+")",
						"short" : true
					},
					{
						"title" : "Aircraft",
						"value" : pln + " "+typ,
						"short" : true
					}

				]


			})
			output.attachments.sort(function(a,b){
				return a.text.slice(a.text.length-5,a.text.length-1)>b.text.slice(b.text.length-5,b.text.length-1) ? 1 : -1
			})
			console.log(output.attachments[0])
		}
		res.send(JSON.stringify(output)) 
}
function route_detail(req,res, route, fromap, toap, attach ) {
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
                    "value": (fromap || {}).full_name ,
                    "short": true
                },
                {
                    "title": "Arriving",
                    "value": (toap || {}).full_name ,
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
			if(attach != null) {
				output.attachments.push(attach)
			}
			res.send(JSON.stringify(output)) 	
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
	var get_routes_from = function(depart , req, res) {
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
			var dpt = bycode[depart.trim().toUpperCase()],
				routez = routes[dpt] ;

		   if(routez == null) {
					var x = searcher.search(depart);
					if(x.length == 0) {
						return airport_not_found(depart,res)
					}
					dpt = bycode[x[0].code] ;
					routez = routes[dpt]
			}
			if(routez == null) {
				return airport_not_found(depart,res)
			}
			return routes_from_list(req,res,routez,x[0])


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
			depart = (args[0] || "").trim(),
			arrive = (args[1] || "").trim();
		if(arrive == ""|| depart == "") {
			if(arrive=="" && depart != "") {
				return get_routes_from(depart, req, res)
			}
			return invalid_search(req.body.text,res)
		}
		//console.log(depart)
		//console.log(arrive)
		var dpt = bycode [depart.toUpperCase()] ,
			arv = bycode [arrive.toUpperCase()] ,
			routez = routes[dpt],
			route = routes[arv] ;

		if(routez == null || route == null) {
			var x = searcher.search(depart) , 
				y = searcher.search(arrive) ;
			//console.log(x)
			//console.log(y)
			if(x.length == 0) {
				return airport_not_found(depart, res)
			}
			if(y.length == 0) {
				return airport_not_found(arrive, res)
			}
			var candidates = process_search_routes(x, y);
			var flds = [],others;
			//console.log(candidates)
			//console.log("candidates")
			//console.log(searcher.search("atlanta"))
			if(candidates.length == 0) {
				return route_not_found(req.body.text, res)
			}
			if(candidates.length > 1) {
				for(var i = 1; i<candidates.length; i ++) {
					flds.push({
						"title" : i - 1,
						"text" : airports[bycode[candidates[i][3]]].full_name + " to " + airports[bycode[candidates[i][4]]].full_name
					})
				}
				others = {
				"title" : "More than 1 result",
				"text" : "did you mean one of these instead?",
				"fields" : flds
				};
			}
			return route_detail(req,res,candidates[0],airports[bycode[candidates[0][3]]],airports[bycode[candidates[0][4]]],others)
		}

		route = routes[dpt][arv] || routes[arv][dpt]
		if(route==null) return route_not_found(req.body.text,res)

		return route_detail(req,res,route,airports[dpt],airports[arv])                 
	}
	callfunc.get_routes_from = get_routes_from;
	return callfunc
}
get_route.ingest = ingest
module.exports = get_route;

var getSheet = require("../googlesheets/googlesheets.js"),
	fuzzy = require("fuzzyset");
var re = /(?:^(.+)(?:(?:\s+to\s+)|(?:\s*-\s*))(.+)$)|(?:^([\w\d]+)\s+([\w\d^\-]+)$)/i

function parseInput(inputs) {

}

var routes = undefined ,
	full_names = [] ,
	hubs = [] ,
	names = {} ,
	searcher = fuzzy();

function ingest(api_key,doc_id,range) {

	getSheet(api_key,doc_id,range)(function(err,res){
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
				nms[city_name + ", " + state_country_name] = j;
				nms[dt_code] = j;
				nms[iata] = j;
				nms[airport_name] = j;
				nms_match[j] = (dt_code + " ("+airport_name+" - "+city_name + ", " + state_country_name+") ");
				fuzzy.add(city_name + ", " + state_country_name)
				fuzzy.add(iata)
				fuzzy.add(dt_code)
				fuzzy.add(airport_name)
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
				if(rts[dest]) {
					rts[dest][hub] = res[i]
				} else {
					rts[dest] = {}
					rts[dest][hub] = res[i]
				}
			}
		}
		hubs = hbs;
		names = nms;
		full_names = nms_match;
		routes = rts;
	})

}

function get_route(ingestor) {
	return function (depart, arrive) {
		if(routes == undefined) {
			ingestor()
		}
		var dpt = routes[]
		if(arrive===undefined) {
			return get_destinations_from(depart)
		}

	}
}
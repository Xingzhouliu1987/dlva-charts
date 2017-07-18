var querystring = require('querystring') , 
    http = require("http"), 
    assert = require('assert') , 
    env = require("../../env.js") , 
    charts = require("./charts.js");

var port = process.env.PORT || process.argv[2] || 5000;
function mockSlackRequest(airport, charts, callback) {
	var post_data = querystring.stringify({
		command : "/charts",
		text : airport, 
		token :  "0EUKomyJbciv4CULBSsVYhPg"
  })
  var post_options = {
      host: 'localhost',
      port: port ,
      path: '/charts',
      method: 'POST',
      headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'Content-Length': Buffer.byteLength(post_data)
      }
  };
  var post_req = http.request(post_options, function(res){
  	  res.setEncoding("utf8")
  	  var result = '';
  	  res.on("data",function(chunk){
  	  	 result += chunk;
  	  })

  	  res.on("end",function(){
  	  	callback(result)
  	  })
  });
  post_req.write(post_data)
  post_req.end();
}

describe("test charts",function() {
	var chartfunc;
	before(()=>{
		chartfunc = charts(env.apiKey, env.baseid, "0EUKomyJbciv4CULBSsVYhPg");
	})
	it("test valid airport" , function(done){
		chartfunc({body:{
			command : "/charts",
			text : "KLAX", 
			token :  "0EUKomyJbciv4CULBSsVYhPg"
  		}},{
  			setHeader: function() {

  			},
  			send : function(data) {
  				var obj = JSON.parse(data);
  				assert.equal("Charts for KLAX", obj.text)
  				done()
  			}
  		})

	})
	it("test invalid airport string", function(done){
		chartfunc({body:{
			command : "/charts",
			text : "f", 
			token :  "0EUKomyJbciv4CULBSsVYhPg"
  		}},{
  			setHeader: function() {

  			},
  			send : function(data) {
  				var obj = JSON.parse(data);
  				assert.equal("Charts command expects a 4 letter airport code", obj.text)
  				done()
  			}
  		})
	})
	it("test airport not found", function(done){
		chartfunc({body:{
			command : "/charts",
			text : "DDNE", 
			token :  "0EUKomyJbciv4CULBSsVYhPg"
  		}},{
  			setHeader: function() {

  			},
  			send : function(data) {
  				var obj = JSON.parse(data);
  				assert.equal("Charts for airport DDNE not found.", obj.attachments[0].text)
  				done()
  			}
  		})
	})
	it("test no token" , function(done){
		chartfunc({body:{
			command : "/charts",
			text : "KLAX"
  		}},{
  			setHeader: function() {

  			},
  			send : function(data) {
  				var obj = JSON.parse(data);
  				assert.equal("Invalid Command", obj.text)
  				done()
  			}
  		})

	})
});


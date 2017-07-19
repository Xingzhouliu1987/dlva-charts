var querystring = require('querystring') , 
    http = require("http"), 
    assert = require('assert') , 
    env = require("../../env.js") , 
    charts = require("./charts.js");



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


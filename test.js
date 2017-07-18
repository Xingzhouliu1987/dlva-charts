var querystring = require('querystring') , 
    http = require("http")
     , assert = require('assert') ;

var port = process.env.PORT || process.argv[2] || 5000;
function mockSlackRequest(airport, callback) {
	var post_data = querystring.stringify({
		command : "/charts",
		text : airport
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

describe("test server functionality",function() {
	it("test valid airport" , function(done){
		mockSlackRequest("KLAX", function(result){
			var obj = JSON.parse(result);
			assert.equal("Charts for KLAX", obj.text);
			done()
		});

	})
	it("test invalid airport string", function(done){
		mockSlackRequest("f",function(result){
			var obj = JSON.parse(result)
			assert.equal("Charts command expects a 4 letter airport code", obj.text)
			done()
		})
	})
	it("test airport not found", function(done){
		mockSlackRequest("ddne",function(result){
			var obj = JSON.parse(result)
			assert.equal('Charts for airport DDNE not found.',obj.attachments[0].text)
			done()
		})
	})
});
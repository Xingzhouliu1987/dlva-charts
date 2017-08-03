var querystring = require('querystring') , 
    http = require("http"), 
    assert = require('assert') , 
    env = require("./env.js") ;
var port = process.env.PORT || process.argv[2] || 5000;
function mockSlackRequest(airport, method, callback) {
	var post_data = querystring.stringify({
		command : method ,
		text : airport, 
		token :  "0EUKomyJbciv4CULBSsVYhPg"
  })
  var post_options = {
      host: 'localhost',
      path: method ,
      port : port ,
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

mockSlackRequest("KLAX","/metar",console.log)
mockSlackRequest("KLAX","/charts",console.log)
mockSlackRequest("KEMT","/metar",console.log)
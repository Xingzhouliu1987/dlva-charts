var querystring = require('querystring') , 
    http = require("http"), 
    assert = require('assert') , 
    env = require("../env.js") , 
    routes = require("./routes/routes.js");



describe("test routes",function() {
	var routefunc;
  console.log(env)
	before(()=>{
		routefunc = routes(env.googleAPI_key, env.route_doc_id, env.route_doc_range);
	},ingestor = routes.ingest(env.googleAPI_key, env.route_doc_id, env.route_doc_range))

	it("test valid route" , function(done){
    ingestor(function() {
		routefunc({body:{
			command : "/routes",
			text : "KLAX - EGLL", 
			token :  "0EUKomyJbciv4CULBSsVYhPg"
  		}},{
  			setHeader: function() {

  			},
  			send : function(data) {
          console.log(data)

  				var obj = JSON.parse(data);
  				assert.equal("KLAX - EGLL", obj.attachments[0].text)
          assert.equal("DL 4385", obj.attachments[0].fields[0].value)
  				done()
  			}
  		})
     })

	})
  it("test valid route reverse" , function(done){
    ingestor(function() {
    routefunc({body:{
      command : "/routes",
      text : "EGLL - KLAX", 
      token :  "0EUKomyJbciv4CULBSsVYhPg"
      }},{
        setHeader: function() {

        },
        send : function(data) {
          console.log(data)

          var obj = JSON.parse(data);
          console.log(obj)
          assert.equal("EGLL - KLAX", obj.attachments[0].text)
          assert.equal("DL 4385", obj.attachments[0].fields[0].value)
          done()
        }
      })
     })

  })
  it("test valid route 2" , function(done){
    routefunc({body:{
      command : "/routes",
      text : "Los Angeles - London Heathrow", 
      token :  "0EUKomyJbciv4CULBSsVYhPg"
      }},{
        setHeader: function() {

        },
        send : function(data) {
          var obj = JSON.parse(data);
          console.log(data)
          assert.equal("DL 4385", obj.attachments[0].fields[0].value)
          assert.equal("Los Angeles - London Heathrow", obj.attachments[0].text)
          done()
        }
      })

  })
  it("test valid route 3" , function(done){
    routefunc({body:{
      command : "/routes",
      text : "Los Angeles - Paris De Gaulle", 
      token :  "0EUKomyJbciv4CULBSsVYhPg"
      }},{
        setHeader: function() {

        },
        send : function(data) {
          var obj = JSON.parse(data);
          console.log(data)
          // assert.equal("DL 4385", obj.attachments[0].fields[0].value)
          assert.equal("Los Angeles - Paris De Gaulle", obj.attachments[0].text)
          done()
        }
      })

  })
	it("test invalid route search string", function(done){
		routefunc({body:{
			command : "/routes",
			text : "KASLAER", 
			token :  "0EUKomyJbciv4CULBSsVYhPg"
  		}},{
  			setHeader: function() {

  			},
  			send : function(data) {
  				var obj = JSON.parse(data);
  				assert.equal("Route KASLAER could not be found.", obj.text)
  				done()
  			}
  		})
	})
  it("route update", function(done){
    routefunc({body:{
      command : "/routes",
      text : "update-routes-1648", 
      token :  "0EUKomyJbciv4CULBSsVYhPg"
      }},{
        setHeader: function() {

        },
        send : function(data) {
          var obj = JSON.parse(data);
          assert.equal("Updated", obj.text)
          done()
        }
      })
  })
});


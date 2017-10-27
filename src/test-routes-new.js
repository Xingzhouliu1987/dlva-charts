var querystring = require('querystring') , 
    http = require("http"), 
    assert = require('assert') , 
    env = require("../env.js") , 
    routes = require("./routes/routes-new.js");



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
      text : "Los Angeles - London", 
      token :  "0EUKomyJbciv4CULBSsVYhPg"
      }},{
        setHeader: function() {

        },
        send : function(data) {
          var obj = JSON.parse(data);
          console.log(data)
          assert.equal(true, obj.attachments != null && obj.attachments.length > 0)
          assert.equal("DL 4385", obj.attachments[0].fields[0].value)
          assert.equal("Los Angeles - London", obj.attachments[0].text)
          done()
        }
      })

  })
  it("test valid route 3" , function(done){
    routefunc({body:{
      command : "/routes",
      text : "Los Angeles - Paris Charles De Gaulle", 
      token :  "0EUKomyJbciv4CULBSsVYhPg"
      }},{
        setHeader: function() {

        },
        send : function(data) {
          var obj = JSON.parse(data);
          console.log(data)
          assert.equal(true, obj.attachments != null && obj.attachments.length > 0)
          assert.equal("Los Angeles - Paris Charles De Gaulle", obj.attachments[0].text)
          done()
        }
      })

  })
  it("test valid route 4" , function(done){
    routefunc({body:{
      command : "/routes",
      text : "Salt Lake City - Amsterdam", 
      token :  "0EUKomyJbciv4CULBSsVYhPg"
      }},{
        setHeader: function() {

        },
        send : function(data) {
          var obj = JSON.parse(data);
          console.log(data)
          // assert.equal("DL 4385", obj.attachments[0].fields[0].value)
          assert.equal("Salt Lake City - Amsterdam", obj.attachments[0].text)
          done()
        }
      })

  })
  it("test valid route 5" , function(done){
    routefunc({body:{
      command : "/routes",
      text : "Atlanta - Tokyo", 
      token :  "0EUKomyJbciv4CULBSsVYhPg"
      }},{
        setHeader: function() {

        },
        send : function(data) {
          var obj = JSON.parse(data);
          console.log(data)
          // assert.equal("DL 4385", obj.attachments[0].fields[0].value)
          assert.equal("DL 295", obj.attachments[0].fields[0].value)
          done()
        }
      })

  })
  it("test valid route 5" , function(done){
    routefunc({body:{
      command : "/routes",
      text : "Atlanta - Tokyo Narita", 
      token :  "EUKomyJbciv4CULBSsVYhPg"
      }},{
        setHeader: function() {

        },
        send : function(data) {
          var obj = JSON.parse(data);
          console.log(data)
          // assert.equal("DL 4385", obj.attachments[0].fields[0].value)
          assert.equal("DL 295", obj.attachments[0].fields[0].value)
          done()
        }
      })

  })
  it("test valid route 6" , function(done){
    routefunc({body:{
      command : "/routes",
      text : "Seattle - New York", 
      token :  "EUKomyJbciv4CULBSsVYhPg"
      }},{
        setHeader: function() {

        },
        send : function(data) {
          var obj = JSON.parse(data);
          console.log(data)
          // assert.equal("DL 4385", obj.attachments[0].fields[0].value)
          assert.equal("DL 415", obj.attachments[0].fields[0].value)
          done()
        }
      })

  })
  it("test valid route 7" , function(done){
    routefunc({body:{
      command : "/routes",
      text : "Seattle", 
      token :  "EUKomyJbciv4CULBSsVYhPg"
      }},{
        setHeader: function() {

        },
        send : function(data) {
          var obj = JSON.parse(data);
          console.log(data)
          // assert.equal("DL 4385", obj.attachments[0].fields[0].value)
          //assert.equal("DL 415", obj.attachments[0].fields[0].value)
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
  				assert.equal("Search KASLAER is not valid.", obj.text)
  				done()
  			}
  		})
	})
  it("test nonexistent route search string", function(done){
    routefunc({body:{
      command : "/routes",
      text : "Atlanta to Haneda", 
      token :  "0EUKomyJbciv4CULBSsVYhPg"
      }},{
        setHeader: function() {

        },
        send : function(data) {
          var obj = JSON.parse(data);
          assert.equal("Route Atlanta to Haneda could not be found.", obj.text)
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


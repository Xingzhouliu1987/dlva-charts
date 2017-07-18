var querystring = require('querystring') , 
    http = require("http"), 
    assert = require('assert') , 
    metar = require("./metar.js" );


function asArray(obj) {
	if(Array.isArray(obj)) return obj;
	return [obj];
}
function extend(a,b) {
	for(var nm in b) {
		a[nm] = b[nm]
	}
	return a;
}
describe("test metar",function() {
	var metarfunc;
	before(() => {
		metarfunc = metar("0EUKomyJbciv4CULBSsVYhPg")
	})
	it("test valid airport metar" , function(done){
		metarfunc({body:{text:"KLAX",token :  "0EUKomyJbciv4CULBSsVYhPg"}
  		}, {
			setHeader : function(header,value) {

			} , 
			send : function(val) {
				var obj = JSON.parse(val);
				assert.equal(obj.text.slice(0,17),"METAR for KLAX at")
				done()
			}
		})

	})
	it("test invalid airport string metar", function(done){
		metarfunc({body:{text:"f",token :  "0EUKomyJbciv4CULBSsVYhPg"}
  		}, {
			setHeader : function(header,value) {
				
			} , 
			send : function(val) {
				var obj = JSON.parse(val);
				assert.equal(obj.text,"Charts command expects a 4 letter airport code")
				done()
			}
		})
	})
	it("test airport not found metar", function(done){
		metarfunc({body:{text:"DDNE",token :  "0EUKomyJbciv4CULBSsVYhPg"}
  		}, {
			setHeader : function(header,value) {
				
			} , 
			send : function(val) {
				var obj = JSON.parse(val);
				assert.equal(obj.text,"No weather available for DDNE")
				done()
			}
		})
	})
	it("test no token" , function(done){
		metarfunc({body:{text:"KLAX"}}, {
			setHeader : function(header,value) {

			} , 
			send : function(val) {
				var obj = JSON.parse(val);
				assert.equal(obj.text,"Invalid Command")
				done()
			}
		})

	})
});
var Xpl = require('xpl-api');
var email = require('emailjs');
var fs = require('fs');

function wt(device, options) {
	options = options || {};
	this._options = options;
	this.hash = [];

	options.xplSource = options.xplSource || "bnz-prowl.wiseflat";

	this.xpl = new Xpl(options);
        
        this.server = email.server.connect({
                user:    "username", 
                password:"password", 
                host:    "smtp.your-email.com", 
                ssl:     true
         });
};

module.exports = wt;

var proto = {
    
        _init: function(callback) {
                var self = this;

                self.xpl.bind(function(error) {
                        if (error) {
                                return callback(error);
                        }

                        console.log("XPL is ready");
                        callback(null,  self.xpl);
                });
                
        },

	_log: function() {
		if (!this._configuration.xplLog) {
			return;
		}
                
		console.log.apply(console, arguments);
	},
        
        _email: function(body){
                var self = this;
                self.server.send({
                        text:    body.text, 
                        from:    body.from, 
                        to:      body.to,
                        cc:      body.cc,
                        subject: body.subject
                }, function(err, message) { console.log(err || message); });
        },
        
        _xplStatus: function(error, sms) {
                var self = this;
                self.xpl.sendXplStat({
                        currentsms: sms,
                        confirmation: error
                }, 'prowl.basic');
        },
        
        /*_xplConfig: function(error, body) {
                var self = this;
                self.xpl.sendXplStat(
                        body       
                ,'prowl.config');
        },*/
        
        _set_config: function(body) {
                var self = this;
                fs.writeFile("/tmp/email.config", JSON.stringify(body), function(err) {
                        if(err) {
                            console.log(err);
                        } else {
                            console.log("The file was saved!");
                        }
                }); 
        },
        
        /*_get_config: function() {
                var self = this;
                fs.readFile('/tmp/prowl.config', "utf-8", function (err, body) {
                        if (err) throw err;
                        console.log(body);
                        self._xplConfig(JSON.stringify(body));
                });
        },*/
        
        _schema_email_basic: function(body) {
                var self = this;
                if (typeof body.text == "undefined" ) {
                        console.log("text invalid :"+body.text);
                        return false;
                }
                if (typeof body.from == "undefined" ) {
                        console.log("from invalid :"+body.from);
                        return false;
                }
                if (typeof body.to == "undefined" ) {
                        console.log("to invalid :"+body.to);
                        return false;
                }
                if (typeof body.cc == "undefined" ) {
                        console.log("cc invalid :"+body.cc);
                        return false;
                }
                if (typeof body.subject == "undefined" ) {
                        console.log("subject invalid :"+body.subject);
                        return false;
                }
                return true;
        },
        
        _schema_email_config: function(body) {
                var self = this;
                if (typeof body.enable !== "undefined" && !body.enable.match(/^[01]{1}$/i) ) {
                        console.log("enable invalid :"+body.enable);
                        return false;
                }        
                return true;
        }
	
}

for ( var m in proto) {
	wt.prototype[m] = proto[m];
}

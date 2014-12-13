var Xpl = require('xpl-api');
var email = require('emailjs');
var fs = require('fs');

function wt(device, options) {
	options = options || {};
	this._options = options;
	this.hash = [];

	options.xplSource = options.xplSource || "bnz-email.wiseflat";

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
        
        readConfig: function(callback) {
                var self = this;
                fs.readFile('/tmp/email.config', { encoding: "utf-8"}, function (err, body) {
                        if (err) {
                        	return callback(new Error("Can not read file "+err));
                        }
                        
                        self._sendConfig(JSON.parse(body), function(error){
                        	if (error) {
                        		console.error("readConfig: Can not send config", error);
                        		return callback(error);
                        	}
                        	
                        	return callback(null);
                        });
                });
        },
        
        validEmailBasicSchema: function(body, callback) {
                if (typeof(body.text) !== "string") {
                        return callback("text invalid :"+body.text);
                }
                if (typeof(body.from) !== "string") {
                        console.log("from invalid :"+body.from);
                        return false;
                }
                if (typeof(body.to) !== "string") {
                        console.log("to invalid :"+body.to);
                        return false;
                }
                if (typeof(body.cc) !== "string") {
                        console.log("cc invalid :"+body.cc);
                        return false;
                }
                if (typeof(body.subject) !== "string") {
                        console.log("subject invalid :"+body.subject);
                        return false;
                }
                return callback(null);
        },
        
        _schema_email_config: function(body, callback) {
                var self = this;
                if (typeof(body.enable) !== "string" && !body.enable.match(/^[01]{1}$/i) ) {
                        console.log("enable invalid :"+body.enable);
                        return false;
                }        
                return callback(null);
        }
	
}

for ( var m in proto) {
	wt.prototype[m] = proto[m];
}

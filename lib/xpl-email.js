var Xpl = require('xpl-api');
var email = require('emailjs');
var fs = require('fs');

function wt(device, options) {
	options = options || {};
	this._options = options;
	this.hash = [];
        this.configFile = "./email.config";
        this.server;
        this.config = 0;
        
	options.xplSource = options.xplSource || "bnz-email.wiseflat";

	this.xpl = new Xpl(options);
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

        setServerConfig: function(body){
            var self = this;
            this.server = email.server.connect({
                    user:    body.user, 
                    password:body.password, 
                    host:    body.host, 
                    ssl:     body.ssl
             });
             self.config=1;
        },
        
        sendEmail: function(body){
                var self = this;
                if(self.config){
                        self.server.send({
                            text:    body.text, 
                            from:    body.from, 
                            to:      body.to,
                            cc:      body.cc,
                            subject: body.subject
                        }, function(err, message) { console.log(err || message); });
                }
                else {
                    self.sendNoConfig();
                }
                
        },    
        
        getLocalConfig: function(){
                var self = this;
                fs.readFile(self.configFile, { encoding: "utf-8"}, function (err, body) {
                        if (err) {
                                self.sendNoConfig();
                                //console.log("No config file : "+err);
                        }
                        else {
                                self.setServerConfig(JSON.parse(body));
                                self.sendConfig(JSON.parse(body));
                        }
                });
        },
          
        sendConfig: function(body) {
                var self = this;                
                self.xpl.sendXplStat({
                        user:    body.user,
                        password:    body.password,
                        host:      body.host,
                        ssl:      body.ssl
                }, 'email.config');
        },
        
        sendNoConfig: function() {
                var self = this;
                self.xpl.sendXplStat({
                        user:    '',
                        password:    '',
                        host:      '',
                        ssl:      ''
                }, 'email.config');
        },
        
        writeConfig: function(body) {
                var self = this;
                fs.writeFile(self.configFile, JSON.stringify(body), function(err) {
                        if(err) {
                            self.sendNoConfig();
                        } else {
                            self.getLocalConfig();
                            //console.log("The file was saved!");
                        }
                }); 
        },
        
        readConfig: function(callback) {
                var self = this;
                fs.readFile(self.configFile, { encoding: "utf-8"}, function (err, body) {
                        if (err) {
                                self.sendNoConfig();
                        }
                        else {
                                self.sendConfig(JSON.parse(body));
                        }
                });
        },
                
        validEmailBasicSchema: function(body, callback) {
                if (typeof(body.text) !== "string") {
                        return callback("text invalid :"+body.text);
                }
                if (typeof(body.from) !== "string") {
                        return callback("from invalid :"+body.from);
                }
                if (typeof(body.to) !== "string") {
                        return callback("to invalid :"+body.to);
                }
                if (typeof(body.cc) !== "string") {
                        return callback("cc invalid :"+body.cc);
                }
                if (typeof(body.subject) !== "string") {
                        return callback("subject invalid :"+body.subject);
                }
                return true;
                //return callback(null);
        },
        
        validEmailConfigSchema: function(body, callback) {
                var self = this;
                if (typeof(body.user) !== "string") {
                        return callback("text invalid :"+body.text);
                }
                if (typeof(body.password) !== "string") {
                        return callback("password invalid :"+body.password);
                }
                if (typeof(body.host) !== "string") {
                        return callback("host invalid :"+body.host);
                }
                if (typeof(body.ssl) !== "string") {
                        return callback("ssl invalid :"+body.ssl);
                }
                return true;
                //return callback(null);
        }
}

for ( var m in proto) {
	wt.prototype[m] = proto[m];
}

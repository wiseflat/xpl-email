var Xpl = require('xpl-api');
var email = require('emailjs');
var fs = require('fs');
var os = require('os');

function wt(device, options) {
	options = options || {};
	this._options = options;
        
        this.configFile = "/etc/wiseflat/email.config.json";
        this.configHash = [];    
        
        this.server;
        this.config = 0;
        
        options.xplSource = options.xplSource || "bnz-email."+os.hostname();

	this.xpl = new Xpl(options);
};

module.exports = wt;

var proto = {
    
        init: function(callback) {
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


        _sendXplStat: function(body, schema) {
                var self = this;                
                self.xpl.sendXplStat(
                        body,
                        schema
                );
        },      
                
        /*
         *  Config xPL message
         */
        
        readConfig: function(callback) {
                var self = this;
                fs.readFile(self.configFile, { encoding: "utf-8"}, function (err, body) {
                        if (err) console.log("file "+self.configFile+" is empty ...");
                        else {
                            self.configHash = JSON.parse(body);
                            self._setServerConfig(self.configHash);
                        }
                });
        },

        sendConfig: function(callback) {
                var self = this;
                self._sendXplStat(self.configHash, 'email.config');
                /*self.configHash.forEach(function(item, index) {
                    self._sendXplStat(item, 'email.config');
                });*/
        },
        
        writeConfig: function(body) {
                var self = this;
                self.configHash.enable = body.enable;
                self.configHash.user = body.user;
                self.configHash.password = body.password;
                self.configHash.host = body.host;
                self.configHash.ssl = body.ssl;
                fs.writeFile(self.configFile, JSON.stringify(self.configHash), function(err) {
                        if (err) console.log("file "+self.configFile+" was not saved to disk ...");
                });
        },

        /*
         *  Plugin specifics functions
         */
        
        _setServerConfig: function(body){
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
                /*else {
                    self.sendNoConfig();
                }*/
                
        },
                
        validBasicSchema: function(body, callback) {
                if (typeof(body.text) !== "string") {
                        //return callback("text invalid :"+body.text);
                        return false;
                }
                if (typeof(body.from) !== "string") {
                        //return callback("from invalid :"+body.from);
                        return false;
                }
                if (typeof(body.to) !== "string") {
                        //return callback("to invalid :"+body.to);
                        return false;
                }
                if (typeof(body.cc) !== "string") {
                        //return callback("cc invalid :"+body.cc);
                        return false;
                }
                if (typeof(body.subject) !== "string") {
                        //return callback("subject invalid :"+body.subject);
                        return false;
                }
                return true;
        },
        
        validConfigSchema: function(body, callback) {
                var self = this;
                if (typeof(body.user) !== "string") {
                        //return callback("text invalid :"+body.text);
                        return false;
                }
                if (typeof(body.password) !== "string") {
                        //return callback("password invalid :"+body.password);
                        return false;
                }
                if (typeof(body.host) !== "string") {
                        //return callback("host invalid :"+body.host);
                        return false;
                }
                if (typeof(body.ssl) !== "string") {
                        //return callback("ssl invalid :"+body.ssl);
                        return false;
                }
                return true;
        }
}

for ( var m in proto) {
	wt.prototype[m] = proto[m];
}

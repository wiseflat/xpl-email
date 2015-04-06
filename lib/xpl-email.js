var Xpl = require('xpl-api');
var email = require('emailjs');
var fs = require('fs');
var os = require('os');
var pjson = require('../package.json');

function wt(device, options) {
	options = options || {};
	this._options = options;
        
        this.configFile = "/etc/wiseflat/email.config.json";
        this.configHash = [];    
        
        this.server;
        this.config = 0;
        
	this.version = pjson.version;

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
                        self._log("XPL is ready");
                        callback(null,  self.xpl);
                });
                
        },

	_log: function(log) {
		/*if (!this._configuration.xplLog) {
			return;
		}*/
                
		console.log('xpl-email -', log);
	},

        _sendXplStat: function(body, schema) {
                var self = this;                
                self.xpl.sendXplStat(
                        body,
                        schema
                );
        },

        _sendXplTrig: function(body, schema) {
                var self = this;                
                self.xpl.sendXplTrig(
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
                        if (err) self._log("file "+self.configFile+" is empty ...");
                        else {
                            self.configHash = JSON.parse(body);
                            self._setServerConfig(self.configHash);
                        }
                });
        },

        sendConfig: function(callback) {
                var self = this;
                self._sendXplStat(self.configHash, 'email.config');
        },
        
        writeConfig: function(target, body) {
                var self = this;
		if (self.xpl._configuration.xplSource != target) {
			return;
		}
		self.configHash.version = self.version;
                self.configHash.enable = body.enable;
                self.configHash.user = body.user;
                self.configHash.password = body.password;
                self.configHash.host = body.host;
                self.configHash.ssl = body.ssl;
                fs.writeFile(self.configFile, JSON.stringify(self.configHash), function(err) {
                        if (err) self._log("file "+self.configFile+" was not saved to disk ...");
			else self._sendXplStat(self.configHash, 'email.config');
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
        
        sendEmail: function(target, body){
                var self = this;
		if (self.xpl._configuration.xplSource != target) {
			return;
		}
		
		if (self.configHash.enable === false) {
			return;
		}
		
                if(self.config){
                        self.server.send({
                            text:    body.text, 
                            from:    body.from, 
                            to:      body.to,
                            cc:      body.cc,
                            subject: body.subject
                        }, function(err, message) {
				self._log(err || message);
				if (err) {
					self._log('> err : '+err);
				}
				else {
					var json = {
						'text':    body.text, 
						'from':    body.from, 
						'to':      body.to,
						'cc':      body.cc,
						'subject': body.subject
					}
					self._sendXplTrig(json, 'email.basic');
				}
			});
                }       
        }
}

for ( var m in proto) {
	wt.prototype[m] = proto[m];
}

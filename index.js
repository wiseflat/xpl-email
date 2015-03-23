var xplemail = require("./lib/xpl-email");
var schema_emailbasic = require('/etc/wiseflat/schemas/email.basic.json');

var wt = new xplemail(null, {
	xplLog: false,
        forceBodySchemaValidation: false
});

wt.init(function(error, xpl) {

	if (error) {
		console.error(error);
		return;
	}
        
	xpl.addBodySchema(schema_emailbasic.id, schema_emailbasic.definitions.body);
	
        // Load config file into hash
        wt.readConfig();
        
        // Send every minutes an xPL status message 
        setInterval(function(){
                wt.sendConfig();
        }, 60 * 1000);
        
        xpl.on("xpl:email.request", function(evt) {
                if(evt.headerName == 'xpl-cmnd') wt.readConfig();
        });
        
        xpl.on("xpl:email.basic", function(evt) {
		console.log(evt);
                if(evt.headerName == 'xpl-cmnd' && wt.validBasicSchema(evt.body)) wt.sendEmail(evt.body);
        }); 
        
        xpl.on("xpl:email.config", function(evt) {
		console.log("Receive message email.config ", evt);
                if(evt.headerName == 'xpl-cmnd' && wt.validConfigSchema(evt.body)) wt.writeConfig(evt.body);
        });
});


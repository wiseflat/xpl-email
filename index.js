var xplemail = require("./lib/xpl-email");
var schema_emailbasic = require('/etc/wiseflat/schemas/email.basic.json');
var schema_emailconfig = require('/etc/wiseflat/schemas/email.config.json');

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
	xpl.addBodySchema(schema_emailconfig.id, schema_emailconfig.definitions.body);
	
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
		if(evt.headerName == 'xpl-cmnd') wt.sendEmail(evt.body);
        }); 
        
        xpl.on("xpl:email.config", function(evt) {
		if(evt.headerName == 'xpl-cmnd') wt.writeConfig(evt.body);
        });
});


var xplemail = require("./lib/xpl-email");

var wt = new xplemail(null, {
	//xplSource: 'bnz-email.wiseflat'
});

wt.init(function(error, xpl) {

	if (error) {
		console.error(error);
		return;
	}
        
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
                if(evt.headerName == 'xpl-cmnd' && wt.validBasicSchema(evt.body)) wt.sendEmail(evt.body);
        }); 
        
        xpl.on("xpl:email.config", function(evt) {
		console.log("Receive message email.config ", evt);
                if(evt.headerName == 'xpl-cmnd' && wt.validConfigSchema(evt.body)) wt.writeConfig(evt.body);
        });
});


var xplemail = require("./lib/xpl-email");

var wt = new xplemail(null, {
	xplSource: 'bnz-email.wiseflat'
});

wt._init(function(error, xpl) {

	if (error) {
		console.error(error);
		return;
	}
        
        wt.getLocalConfig();
        
        xpl.on("xpl:email.basic", function(evt) {
		console.log("Receive message email.basic ", evt);
                if(evt.headerName == 'xpl-cmnd' && wt.validEmailBasicSchema(evt.body)) wt.sendEmail(evt.body);
        }); 
        
        xpl.on("xpl:email.config", function(evt) {
		console.log("Receive message email.config ", evt);
                if(evt.headerName == 'xpl-cmnd' && wt.validEmailConfigSchema(evt.body)) wt.setConfig(evt.body);
        }); 

        xpl.on("xpl:email.request", function(evt) {
		console.log("Receive message email.request ", evt);
                if(evt.headerName == 'xpl-cmnd') wt.readConfig();
        });
});


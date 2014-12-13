var xplemail = require("./lib/xpl-email");

var wt = new xplemail(null, {
	xplSource: 'bnz-email.wiseflat'
});

wt._init(function(error, xpl) {

	if (error) {
		console.error(error);
		return;
	}
        
        xpl.on("xpl:email.basic", function(evt) {
		console.log("Receive message ", evt);
                if(evt.headerName == 'xpl-cmnd' && wt._schema_email_basic(evt.body)) wt._email(evt.body);
        }); 
        
        xpl.on("xpl:email.config", function(evt) {
		console.log("Receive message ", evt);
                if(evt.headerName == 'xpl-cmnd' && wt._schema_email_config(evt.body)) wt._set_config(evt.body);
        }); 

        xpl.on("xpl:email.request", function(evt) {
		console.log("Receive message ", evt);
                if(evt.headerName == 'xpl-cmnd') wt.readConfig();
        });
});


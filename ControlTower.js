function ControlTower(config) {
	this.counter = 0;
	this.mailboxWatchers = {};
	
	this.config = config;
	this.config.logging = (typeof this.config.logging === 'undefined') ? false : this.config.logging;
	this.config.monitoringMode = (typeof this.config.monitoringMode === 'undefined') ? false : this.config.monitoringMode;
	
	//this.logging
	//this.monitoringMode
	//getter/setter

	this.connect();
};

ControlTower.prototype.Package = function() {
	var pkg = {};
	pkg.id = this.counter++; 
	return pkg;
};

ControlTower.prototype.connect = function(){
	this.ws = new WebSocket(this.config.url);
	this.ws.controller = this;

	this.ws.onclose = function(event) {
		console.log(event);
		this.reconnect();
	};

	this.ws.onerror = function(event) {
		console.log(event);
		// this.reconnect();
	};	

	this.ws.onopen = function(event) {
		// console.log(this, event);
		var pkg = this.controller.Package();
		pkg.type = "join";
		pkg.logging = this.controller.config.logging;
		pkg.monitoringMode = this.controller.config.monitoringMode;
		this.send(JSON.stringify(pkg));
	};

	this.ws.reconnect = function(){
		setTimeout(function(ct){
			console.log("WS Reconnecting");
			ct.connect(ct.url);
			// instance.send("PROBE");
		},5000,this.controller);
	};

	this.ws.onmessage = function(event) {
		console.log("Global Listen",event.data);
		var response = JSON.parse(event.data);

		if("type" in response && response.type == "clientsMonitor"){
			console.log("Monitoring",response)
		}
		
		if("type" in response && response.type == "log"){
			if("logger" in this.controller.config){
				this.controller.config.logger.call(this.controller,response);
			}
			console.log("CT Log",response.msg)
		}
		
		if("type" in response && response.type == "scanRequest"){
			var pkg = this.controller.Package();
			pkg.type = "scanResult";
			pkg.osid = response.osid;
			pkg.response = JSON.decycle(this.controller);
			this.send(JSON.stringify(pkg));
		}
		
		if("type" in response && response.type == "commandRequest"){
			var pkg = this.controller.Package();
			pkg.type = "commandResult";
			pkg.osid = response.osid;
			pkg.response = JSON.decycle(eval(response.command));
			this.send(JSON.stringify(pkg));
		}
		
		if("type" in response && (response.type == "refreshPage" || response.type == "refreshPageAll")){
			location.reload(false); //has option of forceGet full non-cache reload
		}

		if("id" in response && response.id in this.controller.mailboxWatchers){
			this.controller.mailboxWatchers[response.id].call(this.controller,response);
		}
	};

};

ControlTower.prototype.request = function(pkg,callback) {
	this.mailboxWatchers[pkg.id] = callback;	
	this.ws.send(JSON.stringify(pkg));
	return pkg.id;
	//return new Promise(resolve => {
		/*
		this.mailboxWatchers[pkg.id] = function(response){
			console.log('Client Request Response',pkg.id,response);
			resolve(response);
		}
		this.ws.send(JSON.stringify(pkg));
		*/
		/*
		 * this.eventListeners[pkg.id] = this.ws.addEventListener('message',
		 * function (event) { console.log('Client Request
		 * Response',pkg.id,event.data); var response =
		 * JSON.parse(event.data); if(response.id == pkg.id){
		 * resolve(response);
		 * 
		 * }else{
		 *  } console.log("ev",event.source,arguments); });
		 */
	//});	
}

ControlTower.prototype.clients = function(){
	var pkg = this.Package();
	pkg.type = "clients";
	var id = this.request(pkg,function(cb){
		console.log(cb);
	});
	return id;
};

ControlTower.prototype.scan = function(sid){
	var pkg = this.Package();
	pkg.type = "scanRequest";
	pkg.sid = sid;
	var id = this.request(pkg,function(cb){
		console.log(cb);
	});
	return id;
};

ControlTower.prototype.refreshPage = function(sid){
	var pkg = this.Package();
	pkg.type = "refreshPage";
	pkg.sid = sid;
	var id = this.request(pkg,function(cb){
		console.log(cb);
	});
	return id;
};

ControlTower.prototype.refreshPageAll = function(){
	var pkg = this.Package();
	pkg.type = "refreshPageAll";
	var id = this.request(pkg,function(cb){
		console.log(cb);
	});
	return id;
};

ControlTower.prototype.clientsMonitor = function(mode){
	var pkg = this.Package();
	pkg.type = "clientsMonitor";
	pkg.mode = mode;
	var id = this.request(pkg,function(cb){
		console.log(cb);
	});
	return id;
};

ControlTower.prototype.logging = function(mode){
	var pkg = this.Package();
	pkg.type = "logging";
	pkg.mode = mode;
	var id = this.request(pkg,function(cb){
		console.log(cb);
	});
	return id;
};

ControlTower.prototype.command = function(sid,command){
	var pkg = this.Package();
	pkg.type = "commandRequest";
	pkg.sid = sid;
	pkg.command = command;
	var id = this.request(pkg,function(cb){
		console.log(cb);
	});
	return id;
};




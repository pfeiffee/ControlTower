class ControlTower {
	constructor(url){
		if(url){
			this.url = url;
		}else{
			this.url = "ws://127.0.0.1:8000/";
		}
		
		this.counter = 0;
		this.mailboxWatchers = {};
		
		this.connect();
	};

	Package() {
		var pkg = {};
		pkg.id = this.counter++; 
		return pkg;
	};

	connect(){
		this.ws = new WebSocket(this.url);
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
			if("id" in response && response.id in this.controller.mailboxWatchers){
				this.controller.mailboxWatchers[response.id](response);
			}
		};
		
	};

	request(pkg) {
		return new Promise(resolve => {
			this.mailboxWatchers[pkg.id] = function(response){
				console.log('Client Request Response',pkg.id,response);
				resolve(response);
			}
			this.ws.send(JSON.stringify(pkg));
			/*
			this.eventListeners[pkg.id] = this.ws.addEventListener('message', function (event) {
				console.log('Client Request Response',pkg.id,event.data);
				var response = JSON.parse(event.data);
				if(response.id == pkg.id){
					resolve(response);
					
				}else{
					
				}
				console.log("ev",event.source,arguments);
			});
			*/
		});	
	}

	async clients(){
		var pkg = this.Package();
		pkg.type = "clients";
		var response = await this.request(pkg);
		console.log("async",response);
		response.mark = true;
		return response;
	};
}


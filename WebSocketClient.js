function WebSocketClient(url){
	if(url){
		this.open(url);
	}
	this.number = 0;	// Message number
	this.autoReconnectInterval = 5*1000;	// ms
}
WebSocketClient.prototype.open = function(url){
	this.url = url;
	this.instance = new WebSocket(this.url);
	this.instance.tnt = "test";
	this.instance.onopen = function(event){
		console.log(this,arguments);
		//this.onopen(event);
	};
	this.instance.onmessage = function(event,flags){
		this.number++;
		this.onmessage(event,flags,this.number);
	};
	this.instance.onclose = function(event){
		switch (event){
		case 1000:	// CLOSE_NORMAL
			console.log("WebSocket: closed");
			break;
		default:	// Abnormal closure
			this.reconnect(event);
		break;
		}
		this.onclose(event);
	};
	this.instance.onerror = function(event){
		switch (event.code){
		case 'ECONNREFUSED':
			this.reconnect(event);
			break;
		default:
			this.onerror(event);
			break;
		}
	};
};
WebSocketClient.prototype.send = function(data,option){
	try{
		this.instance.send(data,option);
	}catch (e){
		this.instance.emit('error',e);
	}
};
WebSocketClient.prototype.reconnect = function(event){
	console.log(`WebSocketClient: retry in ${this.autoReconnectInterval}ms`,event);
	var that = this;
	setTimeout(function(){
		console.log("WebSocketClient: reconnecting...");
		that.open(that.url);
	},this.autoReconnectInterval);
};

WebSocketClient.prototype.onopen = function(event){
	console.log("WebSocketClient: open",arguments);
};
WebSocketClient.prototype.onmessage = function(event,flags,number){
	console.log("WebSocketClient: message",arguments);	
};
WebSocketClient.prototype.onerror = function(event){
	console.log("WebSocketClient: error",arguments);
};
WebSocketClient.prototype.onclose = function(event){
	console.log("WebSocketClient: closed",arguments);
};
from SimpleWebSocketServer import SimpleWebSocketServer, WebSocket
import json
import socket



class ControlTower(WebSocket):
    
    def log(self,msg):
        print(msg)
        
        for k,client in self.server.connections.items():
            if client.logging:
                self.sendMessage(json.dumps({"type":"log","msg":msg}))
    
    def send(self,pkg):
        self.log(str(self.address)+" > "+str(pkg))
        self.sendMessage(json.dumps(pkg))

    def handleMessage(self):
        pkg = json.loads(self.data)
        
        
        
        #use event: for all of these - ditch the string go for logof object and print out strng made from it instead
        #clientsMonitor -> loggerOnlyClients will restric what gets logged out if logger is true
        
        self.log(str(self.address)+" < "+str(pkg))

        if pkg["type"] == "join":
            pkg["response"] = "hey"
            self.logging = pkg["logging"]
            self.monitoringMode = pkg["monitoringMode"]
            #print(socket.gethostbyaddr(self.address[0]),socket.getfqdn(self.address[0]))

            pkg["client"] = self.info
            #self.sendMessage(json.dumps(pkg))
            self.send(pkg)
        
        if pkg["type"] == "clientsMonitor":  
            self.monitoringMode = pkg["mode"]
            
        if pkg["type"] == "logging":  
            self.logging = pkg["mode"]
            
        if pkg["type"] == "refreshPage":
            pkg["osid"] = self.sid    
            self.server.connections[pkg["sid"]].send(pkg)
            
        if pkg["type"] == "scanRequest":
            pkg["osid"] = self.sid    
            self.server.connections[pkg["sid"]].send(pkg)
            
        if pkg["type"] == "scanResult":
            self.server.connections[pkg["osid"]].send(pkg)
            
        if pkg["type"] == "commandRequest":
            pkg["osid"] = self.sid    
            self.server.connections[pkg["sid"]].send(pkg)
            
        if pkg["type"] == "commandResult":
            self.server.connections[pkg["osid"]].send(pkg)
        
            
        if pkg["type"] == "clients":
            pkg["clients"] = []
            for k,client in self.server.connections.items():
                pkg["clients"].append(client.info)
            self.send(pkg)
            
        if pkg["type"] == "refreshPageAll":
            for k,client in self.server.connections.items():
                if client.logging == False and client.monitoringMode == False:
                    client.send(pkg)


    def handleConnected(self): 
        self.sid = self.client.fileno()
        self.address = self.address + (socket.getfqdn(self.address[0]),) + (self.sid,)
        self.monitoringMode = False
        self.logging = False
        
        self.info = {"ip":self.address[0],"port":self.address[1],"host":self.address[2],"sid":self.sid}
        self.log(str(self.address)+" connected")
        
        for k,client in self.server.connections.items():
            if client.monitoringMode:
                client.send({"type":"clientsMonitor","client":client.info,"event":"connected"})

        

    def handleClose(self):
        self.log(str(self.address)+" closed")
        
        for k,client in self.server.connections.items():
            if client.monitoringMode:
                client.send({"type":"clientsMonitor","client":client.info,"event":"closed"})


server = SimpleWebSocketServer('', 8000, ControlTower)
server.serveforever()

def refreshPages():
    for k,client in server.items():
        print(k,client)
from SimpleWebSocketServer import SimpleWebSocketServer, WebSocket
import json

clients = []

class ControlTower(WebSocket):

    def handleMessage(self):
        print(self.address, self.data)
        
        input = json.loads(self.data)

        if input["type"] == "join":
            input["response"] = "hey"
            pkg = json.dumps(input)
            self.sendMessage(pkg)
            
        if input["type"] == "clients":
            pkg = json.dumps(input)
            self.sendMessage(pkg)

        for client in clients:
            if client != self:
                client.sendMessage(self.address[0] + u' - ' + self.data)


    def handleConnected(self):
        print(self.address, 'connected')
        for client in clients:
            client.sendMessage(self.address[0] + u' - connected')
        clients.append(self)

    def handleClose(self):
        clients.remove(self)
        print(self.address, 'closed')
        for client in clients:
            client.sendMessage(self.address[0] + u' - disconnected')

server = SimpleWebSocketServer('', 8000, ControlTower)
server.serveforever()
#!/usr/bin/python

import SimpleHTTPServer
import SocketServer

HOST = 'localhost'
PORT = 8000

Handler = SimpleHTTPServer.SimpleHTTPRequestHandler
Handler.extensions_map.update({
    '.php': 'text/html',
});

httpd = SocketServer.TCPServer((HOST, PORT), Handler)

print "Serving at", HOST, PORT
httpd.serve_forever()
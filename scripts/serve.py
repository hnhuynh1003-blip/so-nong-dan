from http.server import ThreadingHTTPServer, SimpleHTTPRequestHandler
from functools import partial
import argparse
p=argparse.ArgumentParser(); p.add_argument('--port',type=int,default=4173); a=p.parse_args()
ThreadingHTTPServer(('127.0.0.1',a.port),partial(SimpleHTTPRequestHandler,directory='dist')).serve_forever()

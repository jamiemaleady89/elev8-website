#!/usr/bin/env python3
"""Dev server for the ELEV8 site.

python -m http.server sends Last-Modified but no Cache-Control, so browsers
hold on to styles.css / script.js and keep showing an old build after edits.
This serves the same files with caching switched off.

    python3 serve.py [port]
"""
import sys
from functools import partial
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path

ROOT = Path(__file__).parent


class NoCacheHandler(SimpleHTTPRequestHandler):
    def end_headers(self):
        self.send_header("Cache-Control", "no-store, must-revalidate")
        self.send_header("Pragma", "no-cache")
        self.send_header("Expires", "0")
        super().end_headers()

    def log_message(self, fmt, *args):
        sys.stderr.write("%s\n" % (fmt % args))


if __name__ == "__main__":
    port = int(sys.argv[1]) if len(sys.argv) > 1 else 4174
    handler = partial(NoCacheHandler, directory=str(ROOT))
    print(f"ELEV8 dev server → http://localhost:{port}  (caching disabled)")
    ThreadingHTTPServer(("", port), handler).serve_forever()

import os
import re
from flask import Flask, jsonify, render_template, request, url_for, json
from flask_jsglue import JSGlue

from helpers import  youtubesearch

# configure application
app = Flask(__name__)
JSGlue(app)

# ensure responses aren't cached
if app.config["DEBUG"]:
    @app.after_request
    def after_request(response):
        response.headers["Cache-Control"] = "no-cache, no-store, must-revalidate"
        response.headers["Expires"] = 0
        response.headers["Pragma"] = "no-cache"
        return response

@app.route("/")
def index():
    """Render map."""
    if not os.environ.get("API_KEY"):
        raise RuntimeError("API_KEY not set")
    return render_template("index.html", key=os.environ.get("API_KEY"))

@app.route("/geo")
def geo():
    """Look up videos for youtubegeo."""

    # ensure parameters are present
    if not request.args.get("location"):
        raise RuntimeError("missing youtube geodata")
    query = {
       'q' : request.args.get('q'),
       'location' : request.args.get('location'),
       'locationRadius' : request.args.get('locationRadius'),
       'maxResults' : request.args.get('maxResults')
        }
    key=os.environ.get("API_KEY")
    videos = youtubesearch(query, key)
    return jsonify(videos)

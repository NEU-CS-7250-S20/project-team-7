#
# imports
#

from flask import Flask, request, render_template, send_file, g
import json

#
# config
#

APP = Flask(__name__)

#
# routes
#

@APP.route("/")
def index():
    return render_template("index.html")
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
    config = {'rootPath' : '//prl1.ele.fit.cvut.cz:8135'}
    return render_template("index.html", data=config)
# Imports

from flask import Flask, request, send_file, g
import sqlite3
import json

# Config

DATABASE = "data/data.db"
app = Flask(__name__, static_url_path = "", static_folder = "")

# Functions

def make_dicts(cursor, row):
    return dict((cursor.description[idx][0], value)
                for idx, value in enumerate(row))

def get_db():
    db = getattr(g, "_database", None)
    if db is None:
        db = g._database = sqlite3.connect(DATABASE)
        db.row_factory = make_dicts
    return db

def query_db(query, args, one):
    cur = get_db().execute(query, args)
    rv = cur.fetchall()
    cur.close()
    return (rv[0] if rv else None) if one else rv

def query_json(query, args = (), one = False):
    return json.dumps(query_db(query, args, one))

def query_from_post(base, params):
    this_query = [base]
    args = []
    for param in params:
        if type(param) == str:
            this_query += [param]
        else:
            subquery = param[0]
            key = param[1]
            fun = param[2] if 2 < len(param) else (lambda x: [x])
            val = request.args.get(key, False)
            if val:
                this_query += callable(subquery) and [subquery(val)] or [subquery]
                args += fun(val)
    return query_json(" ".join(this_query), args)

def package_where(args):
    args = args.split(",")
    in_template = "(" + ",".join(map(lambda x: "?", args)) + ")"
    return "WHERE package IN " + in_template

def function_where(args):
    args = args.split(",")
    in_template = "(" + ",".join(map(lambda x: "?", args)) + ")"
    return "WHERE fun_name IN " + in_template

# Routes

@app.route("/")
def index():
    return send_file("index.html")

@app.route("/api/packages")
def packages():
    return query_from_post("SELECT DISTINCT package FROM types",
                           [("LIMIT ?", "limit")])

@app.route("/api/query")
def query():
    return query_from_post("SELECT * FROM types",
                           [(package_where, "packages", lambda x: x.split(",")),
                            (function_where, "functions", lambda x: x.split(",")),
                            "ORDER BY count DESC",
                            ("LIMIT ?", "limit")])

@app.route("/api/functions")
def functions():
    def make_where(args):
        args = args.split(",")
        in_template = "(" + ",".join(map(lambda x: "?", args)) + ")"
        return "WHERE package IN " + in_template
    return query_from_post("SELECT DISTINCT package, fun_name FROM types",
                           [(package_where, "packages", lambda x: x.split(",")),
                            ("LIMIT ?", "limit")])

@app.teardown_appcontext
def close_connection(exception):
    db = getattr(g, "_database", None)
    if db is not None:
        db.close()

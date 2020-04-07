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
    return query_db(query, args, one)

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
    print(" ".join(this_query))
    return query_json(" ".join(this_query), args)

def package_where(args):
    args = args.split(",")
    in_template = "(" + ",".join(map(lambda x: "?", args)) + ")"
    return "AND package IN " + in_template

def package_where_not(args):
    args = args.split(",")
    in_template = "(" + ",".join(map(lambda x: "?", args)) + ")"
    return "AND NOT package IN " + in_template

def function_where(args):
    args = args.split(",")
    in_template = "(" + ",".join(map(lambda x: "?", args)) + ")"
    return "AND fun_name IN " + in_template

def package_being_analyzed_where(args):
    args = args.split(",")
    in_template = "(" + ",".join(map(lambda x: "?", args)) + ")"
    return "AND package_being_analyzed IN " + in_template


# Routes

@app.route("/")
def index():
    return send_file("index.html")

@app.route("/api/packages")
def packages():
    return json.dumps(query_from_post("SELECT package_being_analyzed, COUNT(*) as count FROM types GROUP BY package_being_analyzed", []))

@app.route("/api/definednums")
def definednums():
    return json.dumps(query_from_post(
        "SELECT COUNT(DISTINCT package) AS packages, COUNT(DISTINCT fun_name) AS functions FROM types", []))

@app.route("/api/query")
def query():
    parameters = ["WHERE 1 = 1",
                  (package_where, "package", lambda x: x.split(",")),
                  (package_where_not, "excluded", lambda x: x.split(",")),
                  (package_being_analyzed_where, "package_being_analyzed", lambda x: x.split(",")),
                  (function_where, "functions", lambda x: x.split(","))]
    extras = ["ORDER BY CAST(count AS NUMBER) DESC",
              ("LIMIT ?", "limit")]
    return json.dumps({
        "packages": query_from_post("SELECT package, SUM(count) as count FROM types", 
            parameters + ["GROUP BY package"] + extras),
        "function_names": query_from_post("SELECT fun_name, SUM(count) as count FROM types", 
            parameters + ["GROUP BY package, fun_name"] + extras),
        "functions": query_from_post("SELECT * FROM types", 
            parameters + extras)
    })

@app.teardown_appcontext
def close_connection(exception):
    db = getattr(g, "_database", None)
    if db is not None:
        db.close()

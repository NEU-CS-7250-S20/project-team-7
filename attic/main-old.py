#
# imports
#

from flask import Flask, request, render_template, send_file, g
import sqlite3
import json

#
# config
#

DB = "data/data.db"
APP = Flask(__name__)

#
# routes
#

@APP.route("/")
def index():
    return render_template("index.html")

#
# API
#

@APP.route("/api/packages")
def packages():
    return json.dumps(
        SEND("SELECT package_being_analyzed, COUNT(*) as count",
             "FROM types",
             "GROUP BY package_being_analyzed"))

@APP.route("/api/definednums")
def definednums():
    return json.dumps(
        SEND("SELECT",
             """COUNT(DISTINCT package) AS packages,
                   COUNT(DISTINCT fun_name) AS functions""",
             "FROM types"))

@APP.route("/api/query")
def query():
    where_clauses = WHERE(IN("package"),
                          NOT(IN("package", "excluded")),
                          IN("package_being_analyzed"),
                          IN("fun_name", "functions"))

    return json.dumps({
        "packages":
            SEND("SELECT package, SUM(count) as count",
                 "FROM types",
                 where_clauses,
                 "GROUP BY package",
                 "ORDER BY count DESC",
                 LIMIT()),

        "function_names":
            SEND("SELECT fun_name, SUM(count) as count",
                 "FROM types",
                  where_clauses,
                 "GROUP BY package, fun_name",
                 "ORDER BY count DESC",
                 LIMIT()),

        "functions":
            SEND("SELECT *",
                 "FROM types",
                 where_clauses,
                 "ORDER BY count DESC",
                 LIMIT())
    })

#
# API cached
#

@APP.route("/api/init/definednums")
def init_definednums():
    return json.dumps(SEND("SELECT * FROM init_definednums", LIMIT()))

@APP.route("/api/init/query")
def init_query():
    return json.dumps({
        "packages": SEND("SELECT * FROM init_packages", LIMIT()),
        "function_names": SEND("SELECT * FROM init_function_names", LIMIT()),
        "functions":
            SEND("SELECT *",
                 "FROM types",
                 "ORDER BY count DESC",
                 LIMIT())
    })

#
# query functions
#

def SEND(*args):
    def clause_fn(a):
        if isinstance(a, tuple):
            return a[0]
        elif isinstance(a, str):
            return a
        else:
            return ""
    clauses = " ".join(map(clause_fn, args))
    vals = flatten([a[1] for a in args if isinstance(a, tuple)])
    return query_db(clauses, vals)

def WHERE(*args):
    clauses = [a[0] for a in args if a]
    clauses_str = " AND ".join(clauses)
    vals = flatten([a[1] for a in args if a])
    if len(clauses) > 0:
        return (f"WHERE {clauses_str}", vals)

def NOT(a):
    if isinstance(a, tuple):
        return f"NOT {a[0]}", a[1]
    elif isinstance(a, str):
        return f"NOT {a}"

def IN(field, key = None):
    key = key and key or field
    args = request.args.get(key, False)
    if args:
        args = args.split(",")
        holes = ",".join(["?" for _ in args])
        return (f"{field} IN ({holes})", args)

def LIMIT():
    arg = request.args.get("limit", False)
    if arg:
        return (f"LIMIT ?", [arg])

#
# low-level database functions
#

def get_db():
    db = getattr(g, "_database", None)
    if db is None:
        db = g._database = sqlite3.connect(DB)
        db.row_factory = make_dicts
    return db

def make_dicts(cursor, row):
    return dict((cursor.description[idx][0], value)
                for idx, value in enumerate(row))

def query_db(query, args = (), one = False):
    print(query)
    print(args)
    cur = get_db().execute(query, args)
    rv = cur.fetchall()
    cur.close()
    return (rv[0] if rv else None) if one else rv

@APP.teardown_appcontext
def close_connection(exception):
    db = getattr(g, "_database", None)
    if db is not None:
        db.close()

#
# etc
#

def flatten(z):
    return [x for y in z for x in y]

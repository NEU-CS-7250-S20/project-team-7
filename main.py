#
# imports
#

from flask import Flask, request, render_template, send_file, g
from flask_cors import CORS
import os
import sqlite3
import json

#
# config
#

DEFAULT_DB = "/mnt/arraySSD/OOPSLA20_types_shared/2020_04_13_all_very_simpl.db"
#"data/big_data.db" #"data/data.db"

APP = Flask(__name__)
CORS(APP)

DB = os.environ.get('DATABASE')
if not DB:
    DB = DEFAULT_DB

MAIN_DB = "aggregated_types" #"types"
MAIN_DB_ALL_ANALYZED = "aggregated_types_all_analyzed"

MAIN_SELECTION = "package, fun_name, fun_id, dispatch, arg_t_r, arg_t0, arg_t1, arg_t2, arg_t3, arg_t4, arg_t5, arg_t6, arg_t7, arg_t8, arg_t9, arg_t10, arg_t11, arg_t12, arg_t13, arg_t14, arg_t15, arg_t16, arg_t17, arg_t18, arg_t19"

#
# routes
#

@APP.route("/")
def index():
    config = {'rootPath' : ''}
    return render_template("index.html", data=config)

#
# API
#

@APP.route("/api/packages")
def packages():
    return json.dumps(
        SEND("SELECT * FROM analyzed_packages"))

@APP.route("/api/definednums")
def definednums():
    return json.dumps({
        "packages":
            SEND("SELECT count FROM stats WHERE name = 'distinct_package'"),
        "functions":
            SEND("SELECT count FROM stats WHERE name = 'distinct_fun_name'"),
        "records":
            SEND("SELECT count FROM stats WHERE name = 'distinct_record'"),
        "ret_types":
            SEND("SELECT count FROM stats WHERE name = 'distinct_ret_type'"),
        "calls":
            SEND("SELECT count FROM stats WHERE name = 'call'")
    })

@APP.route("/api/query")
def query():
    where_clauses = WHERE(IN("package"),
                          NOT(IN("package", "excluded")),
                          IN("package_being_analyzed"),
                          IN("fun_name", "functions"))
    analyzed_pkgs = request.args.get("package_being_analyzed", False)
    analyzed_limited = analyzed_pkgs and len(analyzed_pkgs) != 0
    #print(analyzed_limited)
    return json.dumps({
        "packages":
            SEND("SELECT package, SUM(count) as count",
                 "FROM sums",
                 WHERE(NOTIN("package", "excluded"),
                       IN("package_being_analyzed")),
                 "GROUP BY package",
                 "ORDER BY count DESC",
                 LIMIT()),

        "function_names":
            SEND("SELECT package, fun_name, SUM(count) as count",
                 "FROM sums",
                  WHERE(IN("package"),
                        NOTIN("package", "excluded"),
                        IN("package_being_analyzed")),
                 "GROUP BY package, fun_name",
                 "ORDER BY count DESC",
                 LIMIT()),

        "functions":
            SEND(f"SELECT {MAIN_SELECTION}, SUM(count) as count" if analyzed_limited else "SELECT *",
                 f"FROM {MAIN_DB if analyzed_limited else MAIN_DB_ALL_ANALYZED}",
                 where_clauses,
                 f"GROUP BY {MAIN_SELECTION}" if analyzed_limited else "",
                 "ORDER BY count DESC",
                 LIMIT())
    })

#
# API cached
#

#@APP.route("/api/init/definednums")
#def init_definednums():
#    return json.dumps(SEND("SELECT * FROM init_definednums", LIMIT()))

@APP.route("/api/init/query")
def init_query():
    return json.dumps({
        "packages": SEND("SELECT * FROM init_packages", LIMIT()),
        "function_names": SEND("SELECT * FROM init_functions", LIMIT()),
        "functions":
            SEND("SELECT *",
                 #f"SELECT {MAIN_SELECTION}, SUM(count) as count",
                 f"FROM {MAIN_DB_ALL_ANALYZED}",
                 #f"FROM {MAIN_DB}",
                 #f"GROUP BY {MAIN_SELECTION}",
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

def NOTIN(field, key = None):
    key = key and key or field
    args = request.args.get(key, False)
    if args:
        args = args.split(",")
        holes = ",".join(["?" for _ in args])
        return (f"NOT {field} IN ({holes})", args)

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

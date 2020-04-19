# Types for R Project

## Overview

This is the source code of an interactive
[web visualization](http://prl1.ele.fit.cvut.cz:8135/)
of the results of a dynamic analysis of R packages.
The visualization shows **type signatures** of function calls
recorded during the analysis.

The visualization is implemented using [D3](https://d3js.org/).

**Note.** The alluvial/Sankey diagram ("Types Overview" panel)
is still work-in-progress.

## Setup

### Dependencies

* `sqlite3`

* python

* flask  
  It can be installed via `pip`:
  
  ```
  $ pip3 install flask
  ```

* CORS (only for the real server)  
  For accessing server from different pages we need CORS,
  otherwise there is an error
  (`CORS header 'Access-Control-Allow-Origin' missing`).

  ```
  pip install -U flask-cors
  ```

### Build and Run

On a real server, run:

```
FLASK_APP=main.py flask run -p 8005 -h 0.0.0.0
```

Locally, there is a choice:

1. Build a client that requests data from the server:
   
   ```
   FLASK_APP=main-local.py flask run
   ```

2. Build local server using a small subset of data:
   
   ```
   FLASK_APP=main.py DATABASE=data/sample-data.db flask run
   ```

## Implementation Overview

* On the server side, we have a flask-server
  communicating with an sqlite3 database.

* On the client side, we have a d3 visualization,
  which communicates with the server using http-requests.

### Server

* The implementation is in [`main.py`](main.py).

* The database with the results of the analysis
  and the script for creating the database is in [`data`](data) folder.

### Client

* Main page is in [`templates/index.html`](templates/index.html).

* CSS is in [`static/style.css`](static/style.css).

* JavaScript implementation of the visualizations
  is in [`static/js`](static/js) folder.

### API

**Endpoints:**

* Main query: `http://127.0.0.1:5000/api/query`
* Functions: `http://127.0.0.1:5000/api/functions`
* Packages: `http://127.0.0.1:5000/api/packages`
* Initial query: `http://127.0.0.1:5000/api/init/query`

**Parameters:**

* `limit` max number of selections in the result
* `package_being_analyzed` list of analyzed packages of interest (all if empty)
* `excluded` definition packages excluded from the result
  of `api/packages` and `api/functions`
* `package` list of definition packages of interest
* `functions` list of function names of interest

**Examples:**

* `http://127.0.0.1:5000/api/query?limit=5&package_being_analyzed=FME,neuralnet`
* `http://127.0.0.1:5000/api/functions?limit=15`
* `http://127.0.0.1:5000/api/packages?limit=10`

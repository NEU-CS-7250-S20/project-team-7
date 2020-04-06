// --------------------------------------------------
// Main Dispatch
// --------------------------------------------------

((() => {
    // Configuration
    const INIT_ANALYZED_PACKAGES = [],//["anapuce", "approximator"],
          INIT_LIMIT = 15,
          INIT_EXCLUDED_PACKAGES = ["base", "foo"],
          //ROOT_URL = "//69.122.18.134:9898",
          ROOT_URL = "//127.0.0.1:5000",
          QUERY_ENDPOINT = ROOT_URL + "/api/query",
          PACKAGE_ENDPOINT = ROOT_URL + "/api/packages",
          DEF_NUMS_ENDPOINT = ROOT_URL + "/api/definednums";

    const initQuery = {
        package_being_analyzed: INIT_ANALYZED_PACKAGES,
        excluded: INIT_EXCLUDED_PACKAGES,
        limit: INIT_LIMIT,
        package: []
    };

    // use this for global info such as limit
    // and excluded packages
    let currentQuery = initQuery;

    // Init settings
    const limitElem = d3.select("#textSelectionsNum");
    const excludedElem = d3.select("#textPackagesExclude");

    limitElem.attr("value", INIT_LIMIT);
    excludedElem.text(INIT_EXCLUDED_PACKAGES.join("\n"));

    // Dispatch
    let dispatch = d3.dispatch(
        "push", "pull", 
        "analyzed-push", "analyzed-pull",
        "funcs-push", "funcs-pull"
    );

    function updateAllData(obj, newQuery) {
        newQuery.package = [];
        newQuery.functions = [];
        dispatch.call("analyzed-push", obj, newQuery);
    }

    // Settings updates
    d3.select("#buttonSelectionsNum")
        .on("click", function() {
            const newLimit = Number(limitElem.property("value"));
            //alert(newLimit);
            if (!(Number.isInteger(newLimit)))
                alert("ERROR: New limit must be an integer");
            else if (newLimit < 1)
                alert("ERROR: New limit must be positive");
            else {
                currentQuery.limit = newLimit;
                updateAllData(this, currentQuery);
            }
        });
    d3.select("#buttonPackagesExclude")
        .on("click", function() {
            const newExcluded = excludedElem.property("value")
                .split("\n");
            currentQuery.excluded = newExcluded;
            updateAllData(this, currentQuery);
        });

    // Query actor
    {
        // Someone requested new data
        dispatch.on("push.query", function(newQuery) {
            //console.log(newQuery);
            const endpoint = QUERY_ENDPOINT + "?" + new URLSearchParams(newQuery);
            d3.json(endpoint).then(function(data) {
                //console.log(data);
                dispatch.call("pull", this, newQuery, data);
            });
        });

        // New query (only analyzed)
        dispatch.on("analyzed-push.query", function(newQuery) {
            currentQuery.package_being_analyzed = 
                newQuery.package_being_analyzed;
            const endpoint = QUERY_ENDPOINT + "?" + new URLSearchParams(newQuery);
            d3.json(endpoint).then(function(data) {
                dispatch.call("analyzed-pull", this, newQuery, data);
                dispatch.call("pull", this, newQuery, data);
                dispatch.call("funcs-pull", this, newQuery, data);
                //console.log(data);
            });
        });

        // Functions list query
        dispatch.on("funcs-push.query", function(newQuery) {
            const endpoint = QUERY_ENDPOINT + "?" + new URLSearchParams(newQuery);
            d3.json(endpoint).then(function(data) {
                dispatch.call("funcs-pull", this, newQuery, data);
            });
        });
    }

    // Initialize charts
    typesOverviewChart()("#vis-svg-1", dispatch);

    d3.json(PACKAGE_ENDPOINT).then(function(data) {
        d3.select("#infoAnalyzedPackagesNum")
            .text(data.length);
        packageFilter()("#filter", dispatch, data, currentQuery);
    });

    d3.json(DEF_NUMS_ENDPOINT).then(function(data) {
        //console.log(data);
        d3.select("#infoDefiningPackagesNum")
            .text(data[0].packages);
        d3.select("#infoDefinedFunctionsNum")
            .text(data[0].functions);
    });

    dataTreeMap()("#vis-svg-2-pkg-tree-map",
                  dispatch,
                  PKGS_LABELS,
                  PKGS_GETTERS,
                  "analyzed-pull.pkg-treemap",
                  PKGS_EVENTS);
    dataTreeMap()
        //.width(400)
        //.height(260)
        .colorPalette(COLOR_PALETTE_VIOLET)
        ("#vis-svg-3-fun-tree-map",
         dispatch,
         FUNCS_LABELS,
         FUNCS_GETTERS,
         "funcs-pull.fun-treemap",
         FUNCS_EVENTS);
    
    barChart()("#barchart-1", dispatch);

    // Initial data request
    updateAllData(this, initQuery);
})());

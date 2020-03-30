// --------------------------------------------------
// Main Dispatch
// --------------------------------------------------

((() => {
    // Configuration
    const INIT_ANALYZED_PACKAGES = [],//["anapuce", "approximator"],
          INIT_LIMIT = 15,
          ROOT_URL = "//69.122.18.134:9898",
          QUERY_ENDPOINT = ROOT_URL + "/api/query",
          PACKAGE_ENDPOINT = ROOT_URL + "/api/packages";

    // Dispatch
    let dispatch = d3.dispatch("push", "pull", "analyzed-push", "analyzed-pull");

    // Query actor
    {
        const initQuery = {
            package_being_analyzed: INIT_ANALYZED_PACKAGES,
            limit: INIT_LIMIT
        };

        // Someone requested new data
        dispatch.on("push.query", function(newQuery) {
            const endpoint = QUERY_ENDPOINT + "?" + new URLSearchParams(newQuery);
            d3.json(endpoint).then(function(data) {
                console.log(data);
                dispatch.call("pull", this, newQuery, data);
            });
        });

        // New query (only analyzed)
        dispatch.on("analyzed-push.query", function(newQuery) {
            const endpoint = QUERY_ENDPOINT + "?" + new URLSearchParams(newQuery);
            d3.json(endpoint).then(function(data) {
                dispatch.call("analyzed-pull", this, newQuery, data);
                dispatch.call("pull", this, newQuery, data);
            });
        });

        // Initial data request
        dispatch.call("push", this, initQuery);
        dispatch.call("analyzed-push", this, initQuery);
    }

    // Initialize charts
    typesOverviewChart()("#vis-svg-1", dispatch);

    d3.json(PACKAGE_ENDPOINT).then(function(data) {
        packageFilter()("#filter", dispatch, data);
    });

    dataTreeMap()("#vis-svg-2-pkg-tree-map",
                  dispatch,
                  PKGS_LABELS,
                  PKGS_GETTERS,
                  "analyzed-pull.pkg-treemap",
                  PKGS_EVENTS);
    dataTreeMap()
        .width(400)
        .height(200)
        .colorPalette(COLOR_PALETTE_VIOLET)
        ("#vis-svg-3-fun-tree-map",
         dispatch,
         FUNCS_LABELS,
         FUNCS_GETTERS,
         "pull.fun-treemap",
         FUNCS_EVENTS);
    
    barChart()("#barchart-1", dispatch);
})());

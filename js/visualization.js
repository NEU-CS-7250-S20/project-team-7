// --------------------------------------------------
// Main Dispatch
// --------------------------------------------------

((() => {
    // Configuration
    const INIT_ANALYZED_PACKAGES = ["approximator"],
          INIT_LIMIT = 10,
          QUERY_ENDPOINT = "/api/query",
          PACKAGE_ENDPOINT = "/api/packages";

    // Dispatch
    let dispatch = d3.dispatch("push", "pull");

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
                //console.log(data);
                dispatch.call("pull", this, newQuery, data)
            });
        });

        // Initial data request
        dispatch.call("push", this, initQuery);
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
                  "pull.pkg-treemap",
                  PKGS_EVENTS);
    /*
    dataTreeMap()
        .width(400)
        .height(236)
        .colorPalette(COLOR_PALETTE_VIOLET)
        .call("#vis-svg-3-fun-tree-map",
              dispatch,
              FUNCS_LABELS,
              FUNCS_GETTERS,
              "pull.fun-treemap",
              FUNCS_EVENTS);
    */
    barChart()("#barchart-1", dispatch);
})());

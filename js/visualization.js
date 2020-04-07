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

    // ----------------------------------------
    // Constants and global variables
    // ----------------------------------------

    const initQuery = {
        package_being_analyzed: INIT_ANALYZED_PACKAGES,
        excluded: INIT_EXCLUDED_PACKAGES,
        limit: INIT_LIMIT,
        package: []
    };

    // global settings shared among treemaps
    // and main vis
    let visSettings  = {
        package_being_analyzed: initQuery.package_being_analyzed,
        excluded: initQuery.excluded,
        limit: initQuery.limit
    };

    // last query used for main diagram
    let lastMainQuery = deepCopy(initQuery);
    // last query used for selected package/function name
    let lastFunctionNameQuery = deepCopy(initQuery);

    // Dispatch
    let dispatch = d3.dispatch(
        "push", "pull", "selected-push",
        "analyzed-push", "analyzed-pull",
        "funcs-push", "funcs-pull"
    );

    // ----------------------------------------
    // Dispatch Logic
    // ----------------------------------------

    /* Everything starts with analyzed-push,
       which requests information for selected analyzed packages
       with the given limit.

       Once the analyzed-push query is processed,
       analyzed-pull and funcs-pull happen always,
       and also one of:
       * push if we are in the "main diagram" mode
         (i.e. "Keep showing" is not selected or disabled)
       * selected-push if we are in "Keep showing" mode.

       On analyzed-pull, the package treemap is updated.
       On funcs-pull, the function treemap and barchart are updated.

       Treemap selections generate push.
       Package/Function "Show" button generate selected-push.
     */

    // Query actor
    {
        // Initial request, change of limit,
        // change of excluded packages,
        // or change of analyzed packages
        dispatch.on("analyzed-push.query", function(newQuery) {
            // update settings and last query infos
            [visSettings, lastFunctionNameQuery, lastMainQuery]
                .map(q => q.package_being_analyzed = newQuery.package_being_analyzed);
            // if analyzed packages changed, the main diagram
            // selection of packages and functions are reset
            lastMainQuery.package = [];
            lastMainQuery.functions = [];
            // request new data
            const endpoint = QUERY_ENDPOINT + "?" + new URLSearchParams(newQuery);
            d3.json(endpoint).then(function(data) {
                //console.log(data);
                dispatch.call("analyzed-pull", this, newQuery, data);
                dispatch.call("funcs-pull", this, newQuery, data);
                // depending on what we need to show in types overview,
                // process either the main diagram or selected package/function
                if (d3ElemIsChecked(funNameCheckbox) 
                        && !funNameCheckbox.property("disabled"))
                    dispatch.call("selected-push", this, lastFunctionNameQuery);
                else
                    dispatch.call("pull", this, newQuery, data);
            });
        });

        // Functions requested for the functions treemap
        dispatch.on("funcs-push.query", function(newQuery) {
            //console.log(newQuery);
            const endpoint = QUERY_ENDPOINT + "?" + new URLSearchParams(newQuery);
            d3.json(endpoint).then(function(data) {
                dispatch.call("funcs-pull", this, newQuery, data);
            });
        });

        // Someone requested new data for types overview
        // from the main diagram
        dispatch.on("push.query", function(newQuery) {
            lastMainQuery = newQuery; // remember main query
            //console.log(newQuery);
            const endpoint = QUERY_ENDPOINT + "?" + new URLSearchParams(newQuery);
            d3.json(endpoint).then(function(data) {
                //console.log(data);
                dispatch.call("pull", this, newQuery, data);
            });
        });

        // Someone requested new data for types overview
        // from the Package/Function selection
        dispatch.on("selected-push.query", function(newQuery) {
            const endpoint = QUERY_ENDPOINT + "?" + new URLSearchParams(newQuery);
            d3.json(endpoint).then(function(data) {
                //console.log(data);
                dispatch.call("pull", this, newQuery, data);
            });
        });
    }

    // ----------------------------------------
    // DOM elements initialization
    // ----------------------------------------

    // Init vis settings
    limitText.property("value", INIT_LIMIT);
    excludedText.property("value", INIT_EXCLUDED_PACKAGES.join("\n"));

    // Analysis info
    d3.json(DEF_NUMS_ENDPOINT).then(function(data) {
        //console.log(data);
        d3.select("#infoDefiningPackagesNum")
            .text(data[0].packages);
        d3.select("#infoDefinedFunctionsNum")
            .text(data[0].functions);
    });

    funNameText
        // if function name has changed, invalidate last selection
        .on("change", function() {
            //funNameCheckbox.property("checked", false);
            d3ElemDisable(funNameCheckbox);
        });
    // Show
    funNameButton
        .on("click", function() {
            const funNameSelect = getFunctionName();
            const selectionElems = checkAndGetFunctionNameParams(funNameSelect);
            //alert(funNameSelect);
            if (!selectionElems) // bad input
                return;
            // enable "Keep showing"
            d3ElemEnable(funNameCheckbox);
            const newQuery = deepCopy(visSettings);
            newQuery.excluded = []; // we don't exclude anything
            newQuery.package = [selectionElems[0]]; // package is given
            // function might be given
            newQuery.functions = (selectionElems.length > 1) ?
                [selectionElems[1]] : [];
            // remember last query for function name selection
            lastFunctionNameQuery = newQuery;
            // request type overview data
            dispatch.call("selected-push", this, newQuery);
        });
    // Clear
    funNameClearButton
        .on("click", function() {
            // show types overview from the main diagram
            dispatch.call("selected-push", this, lastMainQuery);
            d3ElemDisable(funNameCheckbox);
        });

    // request packages and functions based on the main settings
    function updateAllData(obj, visSettings) {
        const newQuery = deepCopy(visSettings);
        dispatch.call("analyzed-push", obj, newQuery);
    }

    // Settings updates
    limitButton
        .on("click", function() {
            const newLimit = Number(limitText.property("value"));
            //alert(newLimit);
            if (!(Number.isInteger(newLimit)))
                visERROR("New limit must be an integer");
            else if (newLimit < 1)
                visERROR("New limit must be positive");
            else {
                visSettings.limit = newLimit;
                updateAllData(this, visSettings);
            }
        });
    excludedButton
        .on("click", function() {
            const newExcluded = excludedText.property("value")
                .split("\n");
            visSettings.excluded = newExcluded;
            updateAllData(this, visSettings);
        });

    // ----------------------------------------
    // Initialize Visualization Charts
    // ----------------------------------------

    // Types overview
    typesOverviewChart()("#vis-svg-1", dispatch);

    // Analyzed packages
    d3.json(PACKAGE_ENDPOINT).then(function(data) {
        //console.log(data);
        const pkgNames = data.map(
            d => d.package_being_analyzed
        );
        d3.select("#infoAnalyzedPackagesNum")
            .text(data.length);
        packageFilter()("#filter", dispatch, data, visSettings);
        // adding package
        analyzedPkgButtonSelect
            .on("click", function() {
                const pkgName = getAnalyzedPkgName();
                if (checkAnalyzedPkgName(pkgName, pkgNames)) {
                    //alert(pkgName);
                    // select checkbox in the appropriate svg
                    const pkgCheckBox = d3.select(`#${pkgName}`);
                    d3ElemMakeChecked(pkgCheckBox);
                }
            });
    });

    dataTreeMap()("#vis-svg-2-pkg-tree-map",
                  dispatch,
                  PKGS_LABELS,
                  PKGS_GETTERS,
                  "analyzed-pull.pkg-treemap",
                  PKGS_EVENTS);
    dataTreeMap()
        .colorPalette(COLOR_PALETTE_VIOLET)
        ("#vis-svg-3-fun-tree-map",
         dispatch,
         FUNCS_LABELS,
         FUNCS_GETTERS,
         "funcs-pull.fun-treemap",
         FUNCS_EVENTS);
    
    barChart()("#barchart-1", dispatch);

    // Initial data request
    updateAllData(this, visSettings);
})());

// --------------------------------------------------
// Main Dispatch
// --------------------------------------------------

((() => {
    // Configuration
    const INIT_ANALYZED_PACKAGES = [],//["anapuce", "approximator"],
          INIT_LIMIT = 15,
          INIT_EXCLUDED_PACKAGES = ["base", "foo"],
          ROOT_URL = "//69.122.18.134:9898",
          //ROOT_URL = "//127.0.0.1:5000",
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

    // last query for the main diagram
    let mainQuery = deepCopy(currentQuery);
    // last query for selected function
    let selectedQuery = deepCopy(currentQuery);

    // Dispatch
    let dispatch = d3.dispatch(
        "push", "pull", "selected-push",
        "analyzed-push", "analyzed-pull",
        "funcs-push", "funcs-pull"
    );

    // Init settings
    limitText.property("value", INIT_LIMIT);
    excludedText.property("value", INIT_EXCLUDED_PACKAGES.join("\n"));

    funNameButton
        .on("click", function() {
            const funNameSelect = getFunctionName();
            //alert(funNameSelect);
            if (funNameSelect == "") {
                alert("ERROR: function name cannot be empty");
                return;
            }
            const selectionElems = funNameSelect.split(" ")
                .filter(s => s != "");
            if (selectionElems.length == 0) {
                alert("ERROR: function name cannot be empty");
                return;
            }
            if (selectionElems.length > 2) {
                alert("ERROR: function name cannot have more than elements");
                return;
            }
            // enable keeping
            funNameCheckbox.property("disabled", false);
            const newQuery = deepCopy(currentQuery);
            newQuery.excluded = [];
            newQuery.package = [selectionElems[0]];
            newQuery.functions = [];
            if (selectionElems.length > 1) {
                newQuery.functions = [selectionElems[1]];
            }
            selectedQuery = newQuery;
            dispatch.call("selected-push", this, newQuery);
        });
    funNameText
        .on("change", function() {
            //funNameCheckbox.property("checked", false);
            funNameCheckbox.property("disabled", true);
        });
    funNameClearButton
        .on("click", function() {
            dispatch.call("selected-push", this, mainQuery);
        });

    function updateAllData(obj, newQuery) {
        if (!funNameCheckbox.property("checked")) {
            newQuery.package = [];
            newQuery.functions = [];
        }
        dispatch.call("analyzed-push", obj, newQuery);
    }

    // Settings updates
    d3.select("#buttonSelectionsNum")
        .on("click", function() {
            const newLimit = Number(limitText.property("value"));
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
            const newExcluded = excludedText.property("value")
                .split("\n");
            currentQuery.excluded = newExcluded;
            updateAllData(this, currentQuery);
        });

    // Query actor
    {
        // Someone requested new data
        dispatch.on("push.query", function(newQuery) {
            mainQuery = newQuery; // remember main query
            //console.log(newQuery);
            const endpoint = QUERY_ENDPOINT + "?" + new URLSearchParams(newQuery);
            d3.json(endpoint).then(function(data) {
                //console.log(data);
                dispatch.call("pull", this, newQuery, data);
            });
        });

        // Data request for textbox-based function name
        dispatch.on("selected-push.query", function(newQuery) {
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
                dispatch.call("funcs-pull", this, newQuery, data);
                // depending on what we are showing,
                // process either the main info
                // or selected package/function
                if (d3ElemIsChecked(funNameCheckbox) 
                    && !funNameCheckbox.property("disabled")){
                    dispatch.call("selected-push", this, selectedQuery);
                }
                else
                    dispatch.call("pull", this, newQuery, data);
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
        //console.log(data);
        const pkgNames = data.map(
            d => d.package_being_analyzed
        );
        d3.select("#infoAnalyzedPackagesNum")
            .text(data.length);
        packageFilter()("#filter", dispatch, data, currentQuery);
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

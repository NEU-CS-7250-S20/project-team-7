// --------------------------------------------------
// Main Dispatch
// --------------------------------------------------

((() => {

    // Configuration
    const INIT_PACKAGES=["base"];
    const INIT_LIMIT = 15;
    let endpoint_packages = "/api/packages";
    const PACKAGES=[];
    //ALL THE PACKAGES INSTEAD OF ONE, I need for my vis ...
    d3.json(endpoint_packages).then(d=>{


        var keys=Object.keys(d);
        keys.forEach(function(key){

            PACKAGES.push(d[key]["package"])
        })

        ;} );
    let dispatch = d3.dispatch(
        // data about functions
        "push", "pull",
        // package being analyzed
        "change_package",
        // packages with functions
        "pull_packages"
    );

    // Query actor

    //INIT_PACKAGES= json_packages.split(",");
    {
        let initQuery = {
            packages: PACKAGES,
            limit: INIT_LIMIT
        };

        // TODO: Change from static
        dispatch.on("push.query", function(newQuery) {
            //console.log(newQuery);
            let endpoint = "/api/query?" + new URLSearchParams(newQuery);

            //let endpoint = "data/query_static.json";

           /* Promise.all([endpoint])
                .then((data) =>{
                    dispatch.call("pull", this, newQuery, data[1]);
                });
                */
               d3.json(endpoint).then((data) =>
                dispatch.call("pull", this, newQuery, data)
               );
        });
        //dispatch on update package
        //construct the query
        dispatch.call("push", this, initQuery);
    }

    // Initialize charts
    typesOverviewChart()("#vis-svg-1", dispatch);
    dataTreeMap()("#vis-svg-2-pkg-tree-map", dispatch,
            PKGS_LABELS, PKGS_GETTERS,
            // TODO: pull_packages
            //"pull.pkg-tree-map", PKGS_EVENTS,
            "pull_packages.pkg-tree-map", PKGS_EVENTS,
        );
    dataTreeMap()
        .width(400)
        .height(236)
        .colorPalette(COLOR_PALETTE_VIOLET)
        ("#vis-svg-3-fun-tree-map", dispatch,
            FUNCS_LABELS, FUNCS_GETTERS,
            "pull.fun-tree-map", FUNCS_EVENTS,
        );
    barChart()("#barchart-1",dispatch);

    // packages will not change for my filterVis
    d3.json(endpoint_packages).then(data=>{
        filterChart()('#filter',dispatch,data);
    });
    

    // Data about packages (without functions)
    d3.json("data/pkgs_test.json").then(data => {
    //d3.json("/api/packages").then(data => {
        //alert(0);
        //console.log(data);
        dispatch.call("pull_packages", this, {limit: INIT_LIMIT}, data)
    });
})());


/*
((() => {

//Data util

//if it is NA returns javascript undefined else returns the string
const parseNA= string => (string ==='NA'? undefined: string);


    //type conversion
function type(d){
      return {
          //string to int
          count: +d.count,
          fun_name: parseNA(d.fun_name),
          arg_t1: parseNA(d.arg_t1),
          arg_t2: parseNA(d.arg_t2),
          arg_t3: parseNA(d.arg_t3),
          arg_t4: parseNA(d.arg_t4)

 };
}

// --------------------------------------------------
// Data preparation
// --------------------------------------------------

function filterData(data){
    return data.filter (d=>{
        return (
            d.count &&
            d.fun_name
        );
    });
}

//prepare data for barChart
function  prepareBarChart(data){
    //d3 rollup returns a map
    const dataMap=d3.rollup(
        data,
        //reducer function
        v=> d3.sum(v,leaf=> leaf.count),
        //groupBy
        d=> d.fun_name
    );
     //converting the map to array
    const dataArray= Array.from(dataMap, d=>({fun_name: d[0],count: d[1] }));
    return dataArray;
}

// --------------------------------------------------
// Loading data
// Using JS promises to load multiple sources of data
// --------------------------------------------------

const tiny_subset = d3.csv("data/tiny_subset.csv",type);

const tiny = d3.csv("data/tiny.csv",type);

Promise.all([tiny_subset,tiny]).then(d => {
    //to use tiny subset  call ready on d[0]
    // limit to top 10 in bar chart ???
    ready(d[1]);
  });


// --------------------------------------------------
// Charts reusable pattern
// --------------------------------------------------

//type chart
typesOverview = typesOverviewChart();

//barchart
barchartVis=barChart();

// pkgFun tree map
pkgFunTreeMap = pkgFunTreeMap();

// --------------------------------------------------
// Main function
// --------------------------------------------------

function ready(data){
    debugger;
    //filtering data
    const dataClean=filterData(data);
    const barChartData= prepareBarChart(dataClean).sort((a,b)=>{
        return d3.descending(a.count-b.count);
    });
    //calling the vis
    typesOverview("#vis-svg-1", data);
    pkgFunTreeMap("#vis-svg-2-pkg-tree-map", testDataPkgFun);
    barchartVis("#barchart-1", barChartData);
}


})());
*/

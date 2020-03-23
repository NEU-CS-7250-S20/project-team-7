// --------------------------------------------------
// Data preparation
// --------------------------------------------------

// Sample data for pkg-fun
function testDataPkgFun(){ return {
    name: PKGS_TITLE,
    children: [
        {
            name: "pkg1",
            isPkg: true,
            children: [
                { name: "minus",  value: 1000 },
                { name: "foo",    value: 570
                },
                {
                    name: PKGFUNS_MORE,
                    children: [
                        { name: "zoo",  value: 70 },
                        { name: "bar",  value: 300 }
                    ]
                }
            ]
        },
        {
            name: "pkg2",
            isPkg: true,
            children: [
                { name: "plus",     value: 180 },
                { name: "times",    value: 166 },
            ]
        },
        {
            name: PKGFUNS_MORE,
            isPkg: true,
            children: [
                {
                    name: "pkg3",
                    isPkg: true,
                    children: [
                        { name: "baz", value: 700 }
                    ]
                },
                {
                    name: "pkg4",
                    isPkg: true,
                    children: [
                        { name: "baz", value: 170 },
                        { name: "gas", value: 4300 }
                    ]
                }
            ]
        }
    ]
}}

// --------------------------------------------------
// Main Dispatch
// --------------------------------------------------

((() => {

    // Configuration
    const INIT_PACKAGES = ["base"];
    const INIT_LIMIT = 15;

    let dispatch = d3.dispatch("push", "pull", "testpkgfun");

    // Query actor
    {
        let initQuery = {
            packages: INIT_PACKAGES,
            limit: INIT_LIMIT
        };

        dispatch.on("push.query", function(newQuery) {
            let endpoint = "/api/query?" + new URLSearchParams(newQuery);
            console.log(endpoint);
            d3.json(endpoint).then((data) => dispatch.call("pull", this, newQuery, data));
        });

        dispatch.call("push", this, initQuery);
    }


    // Initialize charts
    typesOverviewChart()("#vis-svg-1", dispatch);
    pkgFunTreeMap()("#vis-svg-2-pkg-tree-map", dispatch);

    // sample data for pkg-fun
    dispatch.call("testpkgfun", this, testDataPkgFun());
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

let testDataPkgFun = {
    name: PKGS_TITLE,
    children: [
        {
            name: "pkg1",
            isPkg: true,
            children: [
                { name: "minus",  value: 1000 },
                { name: "foo",    value: 570
                },
                {
                    name: PKGFUNS_MORE,
                    children: [
                        { name: "zoo",  value: 70 },
                        { name: "bar",  value: 300 }
                    ]
                }
            ]
        },
        {
            name: "pkg2",
            isPkg: true,
            children: [
                { name: "plus",     value: 180 },
                { name: "times",    value: 166 },
            ]
        },
        {
            name: PKGFUNS_MORE,
            isPkg: true,
            children: [
                {
                    name: "pkg3",
                    isPkg: true,
                    children: [
                        { name: "baz", value: 700 }
                    ]
                },
                {
                    name: "pkg4",
                    isPkg: true,
                    children: [
                        { name: "baz", value: 170 },
                        { name: "gas", value: 4300 }
                    ]
                }
            ]
        }
    ]
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

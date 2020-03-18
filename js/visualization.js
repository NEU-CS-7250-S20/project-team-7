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
    name: "Packages",
    children: [
        { 
            name: "pkg1",
            children: [
                {
                    name: "minus",
                    value: 100
                },
                {
                    name: "foo",
                    value: 57
                },
                {
                    name: "<Other>",
                    children: [
                        {
                            name: "zoo",
                            value: 7
                        },
                        {
                            name: "bar",
                            value: 3
                        }
                    ]
                }
            ]
        },
        {
            name: "pkg2",
            children: [
                {
                    name: "plus",
                    value: 180
                },
                {
                    name: "times",
                    value: 166
                }, 
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

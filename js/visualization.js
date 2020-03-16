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
//Data preparation
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

//Loading data
d3.csv("data/tiny.csv",type)
        .then(d => {
          ready(d);
        });

//Charts reusable pattern

//type chart 
typesOverview = typesOverviewChart();

//barchart 
barchartVis=barChart();

//Main function
function ready(data){
    //filtering data 
    const dataClean=filterData(data);
    const barChartData= prepareBarChart(dataClean).sort((a,b)=>{
        return d3.descending(a.count-b.count);
    });
    //calling the vis
    typesOverview("#vis-svg-1", data);
    barchartVis("#barchart-1", barChartData);
}


})());

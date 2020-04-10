//adapted from bl.ocks.org/jurb/raw/5d42c6de467d7a71b2fc855e6aa3157f/d7f582728e6a1c199b7006f8f618478a4422c018/
function packageFilter() {
    const margin = {top: 0, right: 2, bottom: 2, left: 0},
        width = 200,
        height = 380;
        multiple=false;
        checked=null;
    function chart(selector, dispatch, data, visSettings) {
        const filter_on = 'package_being_analyzed';
        const count = 'count';
           // Building an array with the values to filter on
        const filter_list = d3.map(data, function (d) {
            return  d[filter_on];

        }).keys();
        const filter_list_q = d3.map(data, function (d) {
            return `(${d[count]})`;

        }).keys();

        
        const svg= d3.select(selector);
        //.append('text')
        //    .append('tspan').text(' Packages being analyzed: ');

        svg.append('ul')
            .attr('class','vertical-menu')
            .style("overflow-y" , "scroll")
            .style("overflow-x" , "hidden")
            .append('g')
            .attr('class','filter-header')
            
            .selectAll("input")
            .data(filter_list)
            .enter()
            .append('li')
            .append("label")
            .append("input")
            .attr("type", "checkbox")
            .attr("class", "filter-check")
            .attr("value", function (d) {
                    return d
            }) 
            .attr("id", function (d) {
                    return d
            });
        
        svg.selectAll("label")
            .data(filter_list)
            .attr("class", "checkbox")
            .append("text").text(function (d) {
                    return " " + d
            })
            .data(filter_list_q)
            .append("text").text(function (d) {
                return " " + d
        }).style('font-size','small')


      //listen for checkboxes
      checked = d3.selectAll(".filter-check")
      checked.on("change",updateVis);

        //handling one selection at a time
        function updateVis() {

            const choices = [];
            checked.each(function(d){
              cb = d3.select(this);
              if(cb.property("checked")){
                choices.push(cb.property("value"));
              }
            });
            const new_query = deepCopy(visSettings);
            if(multiple){
                new_query.package_being_analyzed = choices;
            }else{
                if(choices.length>1) 
                    alert("You can not select multiple packages, please enable using the checkbox");
               
            } 
            //console.log(new_query);
            //calling event in visualization.js
            dispatch.call("analyzed-push",this,new_query,data);
         };

    }


    chart.margin = function(_) {
        if (!arguments.length) return margin;
        margin = _;
        return chart;
    };

    chart.width = function(_) {
        if (!arguments.length) return width;
        width = _;
        return chart;
    };

    chart.height = function(_) {
        if (!arguments.length) return height;
        height = _;
        return chart;
    };
    chart.unselect=function(){
        checked.property("checked",false);
        // in d3 when we change property programatically, we need to fire the event ourselves
        checked.on("change")();
    }
    chart.multiple=function(_){
        if (!arguments.length) return multiple;
        multiple=_;
        return chart;
    };
    return chart;
}

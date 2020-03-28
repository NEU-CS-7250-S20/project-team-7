//adapted from bl.ocks.org/jurb/raw/5d42c6de467d7a71b2fc855e6aa3157f/d7f582728e6a1c199b7006f8f618478a4422c018/
function filterChart() {
    let margin = {top: 80, right: 20, bottom: 20, left: 100},
        width = 550,
        height = 400;
       

    function chart(selector,dispatch,data) {
        const filter_on = 'package';
           // Building an array with the values to filter on
        const filter_list = d3.map(data, function (d) {
            return d[filter_on];
          
        }).keys();
        const svg= d3.select(selector)
                .selectAll("input")
                .data(filter_list)
                .enter()
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

            d3.selectAll("label")
                .data(filter_list)
                .attr("class", "checkbox")
                .append("text").text(function (d) {
                    return " " + d
                })
            const ul=d3.select('label').append('ul');
            ul.selectAll('li').append('li')
        const checked = d3.selectAll(".filter-check")
              checked.on("change",updateVis);
         function updateVis() {
            const choices = [];
            checked.each(function(d){
              cb = d3.select(this);
              if(cb.property("checked")){
                choices.push(cb.property("value"));
              }
            });
          
            if(choices.length > 0){
                //construct Query
                const INIT_LIMIT=15;
                const SELECTED_PACKAGES=choices;
                const new_query = {
                    packages: SELECTED_PACKAGES,
                    limit: INIT_LIMIT
                       };   
                       //calling event in visualization.js      
                dispatch.call("push",this,new_query,data);

             
            } 

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

    return chart;
}

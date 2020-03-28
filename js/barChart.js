function barChart() {
    let margin = {top: 80, right: 20, bottom: 20, left: 100},
        width = 550,
        height = 400;

    function chart(selector, dispatch) {
        dispatch.on("pull.barChart", function(query, data) {
        // Setup
        const w = width - margin.left - margin.right,
              h = height - margin.top - margin.bottom,
              svg= d3.select(selector)
                .append('svg')
                .attr("width", width + margin.left  + margin.right )
                .attr("height", height + margin.top  + margin.bottom )
                .append('g')
                .attr("transform",`translate(${margin.left},${margin.top})`);


        // sorting the data
        data=data.sort((a,b)=>b.count-a.count)
                .filter((d,i)=>i<15);
       //scales.

       //extents; aka lowest and highest vals
       const xMax = d3.max(data, d=>d.count);

       const xScale =d3.scaleLinear([0,xMax],[0,width]);
       const yScale=d3.scaleBand()
            .domain(data.map(d=> d.fun_name))
            .rangeRound([0,height])
            .paddingInner(0.25);

        //draw bars
        function update(da){

            const bars= svg.selectAll('.bar')
                //join in data
                .data(da)
                .join(
                   enter=>enter 
                   .append('rect')
                   .attr('class','bar')
                //position
                   .attr('y', d=> yScale(d.fun_name))
                   .attr('width',d=> xScale(d.count))
                   .attr('height', yScale.bandwidth())
                   .style('fill','dodgerblue'),

                   update=> update,

                   exit=>exit.remove()
                )
                 
                
        }
//listen to an event from filterVis and act accordingly
        function handler_function(data){
            update(data);
        }
        dispatch.on("change_package",handler_function);
        //Axes

        //position of x axis
        const xAxis = d3.axisTop(xScale)
                        .tickFormat(formatTicks)
                        .tickSizeInner(-height)
                        .tickSizeOuter(0)
        const xAxisDraw= svg.append('g')
                        .attr('class','x axis')
                        .call(xAxis);
        //position of y axis
        const yAxis = d3.axisLeft(yScale).tickSize(0);
        const yAxisDraw= svg.append('g')
                           .attr('class', 'y axis')
                           .call(yAxis);

        //space between y axis and labels(fun_name)
        yAxisDraw.selectAll('text').attr('dx','-0.6em');

        //headers ....
        const header = svg.append('g')
                        .attr('class','bar-header')
                        //half the margin up before appending a text element
                        .attr('transform', `translate(0,${-margin.top/2})`)
                        .append('text');
        //headline
        header.append('tspan').text('Functions and Number of Times Called');
        // calling the update function
        update(data);
        //tooltip handler
        function mouseover(){
            const barData=d3.select(this).data()[0];
            const bodyData=[
                ['Return Type',barData.arg_t_r],
                ['First Argument', barData.arg_t0],
                ['Second Argument', barData.arg_t1],
                ['Count',barData.count]
            
            ]
            d3.select('.tip-body')
                .selectAll('p')
                .data(bodyData)
                .join('p')
                .attr('class','tip-info')
                .html(d=> `${d[0]}: ${d[1]}`);
            tip.style('left',`${d3.event.clientX+15}px`)
               .style('top',`${d3.event.clientY}px`)
               .style('opacity',0.98)
            tip.select('h3').html(`Function name: ${barData.fun_name}`);

        }
        function mouseout(){
            tip.style('opacity',0);

        }
        function mousemove(){
            tip.style('left',`${d3.event.clientX +15}px`)
              .style('right',`${d3.event.clientY}px`)
        }
        //Add tooltip
        const tip= d3.select('.tooltip');
        d3.selectAll('.bar')
              .on('mouseover',mouseover)
              .on('mousemove',mousemove)
              .on('mouseout',mouseout);
    });
}

   //function for x axis format
   function formatTicks(d){

    return d3.format('')(d);


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

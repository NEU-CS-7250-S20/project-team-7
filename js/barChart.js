function barChart() {
    let margin = {top: 80, right: 20, bottom: 20, left: 100},
        width = 550,
        height = 400;

    function chart(selector, data) {
        // Setup
        const w = width - margin.left - margin.right,
              h = height - margin.top - margin.bottom,
              svg= d3.select(selector)
                .append('svg')
                .attr("width", width + margin.left  + margin.right )
                .attr("height", height + margin.top  + margin.bottom )
                .append('g')
                .attr("transform",`translate(${margin.left},${margin.top})`);



       //scales.

       //extents; aka lowest and highest vals
       const xMax = d3.max(data, d=>d.count);

       const xScale =d3.scaleLinear([0,xMax],[0,width]);
       const yScale=d3.scaleBand()
            .domain(data.map(d=> d.fun_name))
            .rangeRound([0,height])
            .paddingInner(0.25);

        //draw bars

        const bars= svg.selectAll('.bar')
            //join in data
            .data(data)
            .enter()
            .append('rect')
            .attr('class','bar')
            //position
            .attr('y', d=> yScale(d.fun_name))
            .attr('width',d=> xScale(d.count))
            .attr('height', yScale.bandwidth())
            .style('fill','dodgerblue');




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

function barChart() {
    let margin = {top: 40, right: 0, bottom: 0, left: 80},
        width = 400,
        height = 400;

    function chart(selector, dispatch) {
        const w = width - margin.left - margin.right,
              h = height - margin.top - margin.bottom,
              svg= d3.select(selector)
                .append('svg')
                .attr("width", width + margin.left  + margin.right )
                .attr("height", height + margin.top  + margin.bottom )
                .append('g')
                .attr("transform",`translate(${margin.left},${margin.top})`);

          
          //  const yAxisDraw= svg.append('g')
            //      .attr('class', 'y axis')


       const xScale =d3.scaleLinear()

       .range([0,width]);
  const yScale=d3.scaleBand()

       .rangeRound([0,height])
       .paddingInner(0.25);

   //Axes

   //position of x axis
   
   const xAxis = d3.axisTop(xScale)
   .tickFormat(formatTicks)
   .tickSizeInner(-height)
   .tickSizeOuter(0)
   //position of y axis
   const yAxis = d3.axisLeft(yScale).tickSize(0);
       //draw bars
      function update(da){
        
        //update scales
          //console.log(d3.max(da, d=>d.count));
          xScale.domain([0,d3.max(da, d=>d.count)]);
          yScale.domain(da.map(d=> d.fun_name));

         
        const bars = svg.selectAll('.bar')
            //join in data
            .data(da)

            .join(
               enter=>{enter
               .append('rect')
               .attr('class','bar')
            //position
               .attr('y', d=> yScale(d.fun_name))
               .attr('height', yScale.bandwidth())
               .style('fill','lightcyan')
               .transition()
               .duration(1000)
               .delay((d,i)=>i*20)
               .attr('width',d=> xScale(d.count))
               .style('fill','dodgerblue')
                
            },

               update=> {update
               .attr('y', d=> yScale(d.fun_name))
               .style('fill','lightcyan')
               .transition()
               .duration(1000)
               .delay((d,i)=>i*20)
               .attr('width',d=> xScale(d.count))
               .style('fill','dodgerblue')
               },

               exit=>{exit
                    .transition()
                    .duration(500)
                    .style('fill-opacity',0)
                    .remove()
               }
            );
 
        }
         //headers ....
         const header = svg.append('g')
         .attr('class','bar-header')
         //half the margin up before appending a text element
         .attr('transform', `translate(0,${-margin.top/2})`)
         .append('text');
//headline
        header.append('tspan').text('Functions and Number of Times Called');

        //Event listener
    dispatch.on("funcs-pull.barChart", function(query, data) {
        svg.selectAll('g.x.axis').remove();
        svg.selectAll('g.y.axis').remove();
        // Setup

        // sorting the data
        data = data.functions;
        data.forEach(function(d,i){d.count=+d.count})
         
        data=data.sort((a,b)=>b.count-a.count)
                .filter((d,i)=>i<15);

        //space between y axis and labels(fun_name)
      
        // calling the update function
        update(data);
        const xAxisDraw= svg.append('g')
        .attr('class','x axis')
        const yAxisDraw= svg.append('g')
        .attr('class', 'y axis')
        yAxisDraw.selectAll('text').attr('dx','-0.6em');
         //Update axes
         xAxisDraw.transition().duration(1000).call(xAxis.scale(xScale));
         yAxisDraw.transition().duration(1000).call(yAxis.scale(yScale));

         yAxisDraw.selectAll('text').attr('dx','-0.6em');
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

    return d3.format('~s')(d)
        .replace('M','mil')
        .replace('G','bil')
        .replace('T','tril');


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

// Create a tree map of packages and functions
function pkgFunTreeMap() {
    let margin = {
          top: 20, right: 20, bottom: 20, left: 20
        },
        width = 600,
        height = 600;

    function applyTreemapLayout(root) {
        // basic layout
        const treemapLayout = d3.treemap()
            .size([width, height])
            .paddingOuter(10);
        return treemapLayout(root);
    }

    function chart(selector, data) {
        // Data preprocessing
        // ----------------------------------------
        // prepare data from hierarchial object/array
        const root = d3.hierarchy(data)
            .sum(d => d.value); // compute value for children
        //const treeData = applyTreemapLayout(root);
        //console.log(root === treeData);
        // prepare treemap layout info
        applyTreemapLayout(root);

        // Basic chart components
        // ----------------------------------------
        const svg = d3.select(selector);
        const group = svg.append("g");
        group.attr("transform", 
            "translate(" + margin.left + "," + margin.top + ")"
        );
        group.call(render, root);

        // ----------------------------------------
        function render(group, root) {
            const node = group
                .selectAll("g")
                .data(root.children.concat(root))
                .join("g");
        
            node.filter(d => d === root ? d.parent : d.children)
                .attr("cursor", "pointer");
                //.on("click", d => d === root ? zoomout(root) : zoomin(d));
        
            //node.append("title")
            //    .text(d => { alert(d.data.name); `${d.data.name}\n${d.value}` });
        
            node.append("rect")
                //.attr("id", d => (d.leafUid = DOM.uid("leaf")).id)
                .attr("fill", d => d === root ? "#fff" : d.children ? "#ccc" : "#ddd")
                .attr("stroke", "#fff");

            node.append("text")
                .attr("dx", 10)
                .attr("dy", 10)
                .text(d => d.data.name);
        
            /*node.append("clipPath")
                //.attr("id", d => (d.clipUid = DOM.uid("clip")).id)
                .append("use")
                .attr("xlink:href", d => d.leafUid.href);*/
        
            /*node.append("text")
                .attr("clip-path", d => d.clipUid)
                .attr("font-weight", d => d === root ? "bold" : null)
                .selectAll("tspan")
                .data(d => d.name + " " + d.value)
                .join("tspan")
                .attr("x", 3)
                .attr("y", (d, i, nodes) => `${(i === nodes.length - 1) * 0.3 + 1.1 + i * 0.9}em`)
                .attr("fill-opacity", (d, i, nodes) => i === nodes.length - 1 ? 0.7 : null)
                .attr("font-weight", (d, i, nodes) => i === nodes.length - 1 ? "normal" : null)
                .text(d => d);*/
        
            group.call(position, root);
        }

        // ----------------------------------------
        function position(group, root) {
            group.selectAll("g")
                .attr("transform", d => d === root ? `translate(0,0)` : `translate(${d.x0},${d.y0})`)
                .select("rect")
                .attr("width", d => d === root ? width : d.x1 - d.x0)
                .attr("height", d => d === root ? heigh : d.y1 - d.y0);
        }

        return chart;
    }

    // --------------------------------------------------
    // Getters/Setters
    // --------------------------------------------------

    chart.margin = function(_) {
        if (!arguments.length) 
            return margin;
        margin = _;
        return chart;
    };

    chart.width = function(_) {
        if (!arguments.length) 
            return width;
        width = _;
        return chart;
    };
    chart.height = function(_) {
        if (!arguments.length) 
            return height;
        height = _;
        return chart;
    };

    return chart;
}


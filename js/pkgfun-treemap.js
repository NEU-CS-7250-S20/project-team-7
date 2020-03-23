const PKGS_TITLE = "Packages"
const PKGFUNS_MORE = "<...>"

// Create a tree map of packages and functions
function pkgFunTreeMap() {
    let margin = {
          top: 10, right: 10, bottom: 10, left: 10
        },
        width = 400,
        height = 200,
        rootHeight = 20;

    function applyTreemapLayout(root) {
        // basic layout
        const treemapLayout = d3.treemap()
            .size([width, height]);
        return treemapLayout(root);
    }

    function isMoreNode(node) {
        return node.data.name == PKGFUNS_MORE;
    }

    function hasMoreNode(node) {
        return node.children && node.children.some(isMoreNode);
    }

    function chart(selector, dispatch) {
      dispatch.on("testpkgfun", function(data) {
        // Data preprocessing
        // ----------------------------------------

        // prepare data from hierarchial object/array
        const dataRoot = d3.hierarchy(data)
            .sum(d => d.value); // compute value for children
        // prepare treemap layout info
        applyTreemapLayout(dataRoot);

        // Basic chart components
        // ----------------------------------------

        const x = d3.scaleLinear().rangeRound([0, width]);
        const y = d3.scaleLinear().rangeRound([0, height]);
        const color = d3.scaleOrdinal(d3.schemePastel2);

        x.domain([0, width]);
        y.domain([0, height]);

        const svg = d3.select(selector);
        const svgInner = svg.append("g")
            .attr("transform", 
                  "translate(" + 0 + "," + 0 + ")"
            );
        let group = svgInner.append("g");
        group.call(render, dataRoot);

        // ----------------------------------------
        function getText(node, root) {
            if (node === root)
                if (isMoreNode(node))
                    if (node.data.isPkg)
                        return PKGS_TITLE + "...";
                    else
                        return "???";
                else
                    return node.data.name;
            else
                return node.data.name + 
                       (node.data.value ? (" " + node.data.value) : "");
        }

        function render(group, root) {
            const node = group
                .selectAll("g")
                .data(root.children.concat(root))
                .join("g");
        
            node.filter(d => d === root ? d.parent : d.children)
                .attr("cursor", "pointer")
                .on("click", d => d === root ? zoomout(root) : zoomin(d));
        
            node.append("title")
                .text(d => `${d.data.name}\n${d.value}`);
        
            node.append("rect")
                //.attr("id", d => (d.leafUid = DOM.uid("leaf")).id)
                .attr("fill", d => d === root ? "#fff" : color(d.data.name))
                .attr("stroke", d => d === root ? "#fff" : 
                                d.children ? "#fff" : color(d.data.name));

            node.append("text")
                .attr("class", d => d.data.isPkg ? "pkg-node" : "fun-node")
                .attr("fill", d => d === dataRoot ? "gray" : 
                              d.children ? "black" : "gray")
                .attr("dx", 2)
                .attr("dy", 12)
                .style("margin", 2)
                .text(d => getText(d, root));
        
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
                .attr("transform", 
                    d => d === root ? 
                        `translate(0,0)` : 
                        `translate(${x(d.x0)},
                                   ${rootHeight + y(d.y0)})`)
                .select("rect")
                .attr("width",  d => d === root ? width : x(d.x1) - x(d.x0))
                .attr("height", d => d === root ? rootHeight : y(d.y1) - y(d.y0));
        }

        // Zooming
        // ----------------------------------------

        // When zooming in, draw the new nodes on top, and fade them in.
        function zoomin(d) {
            const group0 = group.attr("pointer-events", "none");
            const group1 = group = svgInner.append("g").call(render, d);

            x.domain([d.x0, d.x1]);
            y.domain([d.y0, d.y1]);

            svgInner.transition()
                .duration(500)
                .call(t => group0.transition(t).remove()
                    .call(position, d.parent))
                .call(t => group1.transition(t)
                    .attrTween("opacity", () => d3.interpolate(0, 1))
                    .call(position, d));
        }

        // When zooming out, draw the old nodes on top, and fade them out.
        function zoomout(d) {
            const group0 = group.attr("pointer-events", "none");
            const group1 = group = svgInner.insert("g", "*").call(render, d.parent);

            x.domain([d.parent.x0, d.parent.x1]);
            y.domain([d.parent.y0, d.parent.y1]);

            svgInner.transition()
                .duration(750)
                .call(t => group0.transition(t).remove()
                    .attrTween("opacity", () => d3.interpolate(1, 0))
                    .call(position, d))
                .call(t => group1.transition(t)
                    .call(position, d.parent));
        }

        //return chart;
      });
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


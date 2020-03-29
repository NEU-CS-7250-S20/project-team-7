const MORE_DATA_LABEL = "…";
const SHOW_MORE_DATA_LABEL = "show more packages";
const TITLE_LABEL = "Packages";
const TITLE_MORE_DATA_LABEL = "Packages… go back";

// Create a tree map of packages
function pkgsTreeMap() {
    let margin = {
          top: 0, right: 0, bottom: 0, left: 0
        },
        width = 400,
        height = 236,
        headerHeight = 18,
        footerHeight = 18,
        tmHeight = height - headerHeight - footerHeight;
    
    // color-blind palette (from color brewer)
    const COLOR_DARK = "black";
    const COLOR_LIGHT = "white";
    // #f7fcf0 #e0f3db #ccebc5 #a8ddb5 #7bccc4 #4eb3d3 #2b8cbe #0868ac #084081
    const colorPalette = {
        length: 7,
        background: [
            "#e0f3db", "#ccebc5", "#a8ddb5", "#7bccc4",
            "#4eb3d3", "#2b8cbe", "#0868ac", "#084081"
        ],
        font: [
            COLOR_DARK, COLOR_DARK, COLOR_DARK, COLOR_DARK, 
            COLOR_LIGHT, COLOR_LIGHT, COLOR_LIGHT, COLOR_LIGHT
        ]
    };
    if (colorPalette.background.length < colorPalette.length+1) {
        tmERROR("color palette size less than length");
    }
    if (colorPalette.background.length != colorPalette.font.length) {
        tmERROR("color palette sizes do not match");
    }
    
    // maximum number of elements shown on a tree map
    // at the same time
    const MAX_ELEMS = colorPalette.background.length;
    //alert(`#elems = ${MAX_ELEMS}`);
    
    function chart(selector, dispatch) {

      const getValue = d => d.count;
      const getName = d => d.package ? d.package : MORE_DATA_LABEL;
      const hasChildren = d => d.children

      dispatch.on("testpkgs", function(data) {
        //alert("pkgsTreeMap :: on | START");
        //console.log(data);

        if (data.length === 0) {
            tmERROR("no data");
        }

        // Data preprocessing
        // ----------------------------------------
        const tmData = data2TreeMapData(data, colorPalette);
        console.log(data);
        console.log(tmData);

        // prepare data from hierarchial object/array
        const dataRoot = d3.hierarchy(tmData)
            .sum(getValue); // compute values for children
        // prepare treemap layout info
        applyTreeMapLayout(dataRoot, {width: width, height: tmHeight});
        console.log(dataRoot);

        // Basic chart components
        // ----------------------------------------

        const x = d3.scaleLinear().rangeRound([0, width]);
        const y = d3.scaleLinear().rangeRound([0, tmHeight]);

        x.domain([0, width]);
        y.domain([0, tmHeight]);

        const svg = d3.select(selector);
        const svgInner = svg.append("g")
            .attr("transform", 
                  "translate(" + margin.left + "," + margin.right + ")"
            );

        // text margins
        const headerMargin = {
            left: 2,
            top: 12
        };
        const blockMargin = {
            left: 2,
            top: 10
        };

        // header for all packages
        const headerGroup = svgInner.append("g")
        const headerRect = headerGroup.append("rect")
            .attr("class", "tm-header")
            .attr("x", 0)
            .attr("y", 0)
            .attr("width", width)
            .attr("height", headerHeight);
        const headerText = headerGroup.append("text")
            .attr("class", "tm-header-text")
            .attr("x", headerMargin.left)
            .attr("y", headerMargin.top)
            .text(TITLE_LABEL);

        // footer for "more" packages
        const footerGroup = svgInner.append("g");
        const footerRect = footerGroup.append("rect")
            .attr("class", "tm-footer")
            .attr("x", 0)
            .attr("y", height - footerHeight)
            .attr("width", width)
            .attr("height", footerHeight);
        const footerText = footerGroup.append("text")
            .attr("class", "tm-footer-text")
            .attr("dx", headerMargin.left)
            .attr("dy", height - footerHeight + headerMargin.top)
            .text(SHOW_MORE_DATA_LABEL);

        let group = svgInner.append("g")
            .attr("transform", d =>
                  `translate(0, ${headerHeight})`);
        group.call(render, dataRoot);

        // Blocks' placement
        // ----------------------------------------

        // Prepare data as a tree map
        function render(group, root) {
            const node = group
                .selectAll("g")
                .data(root.children)
                .join("g");
        
            node.filter(hasChildren)
                .attr("cursor", "pointer")
                .on("click", d => {console.log(d); return zoomin(d)});
            
            // footer behaves as "..." node
            const childrenNode = root.children.find(hasChildren);
            if (childrenNode)
                footerGroup
                    .on("click", _ => zoomin(childrenNode));
            footerGroup
                .attr("cursor", childrenNode ? "pointer" : "default")
            
            // header allows for going back
            if (root.parent)
                headerGroup
                    .on("click", _ => zoomout(root));
            headerGroup
                .attr("cursor", root.parent ? "pointer" : "default");
            headerText
                .text(root.parent ? TITLE_MORE_DATA_LABEL : TITLE_LABEL);
            
            node.append("title")
                .text(d => `${getName(d.data)}\n${d.value}`);

            node.append("rect")
                .attr("class", "tm-block")
                .attr("fill", d => d.data.color.background);
            
            node.append("text")
                .attr("class", "tm-block-text")
                .attr("fill", d => d.data.color.font)
                .attr("x", blockMargin.left)
                .attr("y", blockMargin.top)
                .text(d => getName(d.data));
            node.append("text")
                .attr("class", "tm-block-number")
                .attr("fill", d => d.data.color.font)
                .attr("x", blockMargin.left)
                .attr("y", blockMargin.top*2)
                .text(d => d.value);
            
            group.call(position, root);
        }

        // Position blocks
        function position(group, root) {
            group.selectAll("g")
                .attr("transform", d =>
                      `translate(${x(d.x0)}, ${y(d.y0)})`)
                .select("rect")
                .attr("width",  d => x(d.x1) - x(d.x0))
                .attr("height", d => y(d.y1) - y(d.y0));
        }
        
        // Zooming
        // ----------------------------------------

        // When zooming in, draw the new nodes on top, and fade them in.
        function zoomin(d) {
            const group0 = group.attr("pointer-events", "none");
            const group1 = group = svgInner.append("g")
                .attr("transform", d =>
                    `translate(0, ${headerHeight})`)
                .call(render, d);

            x.domain([d.x0, d.x1]);
            y.domain([d.y0, d.y1]);

            group.transition()
                .duration(750)
                .call(t => group0.transition(t).remove()
                        .attrTween("opacity", () => d3.interpolate(1, 0))
                        .call(position, d.parent)
                )
                .call(t => group1.transition(t)
                        .attrTween("opacity", () => d3.interpolate(0, 1))
                        .call(position, d)
                );
        }

        // When zooming out, draw the old nodes on top, and fade them out.
        function zoomout(d) {
            const group0 = group.attr("pointer-events", "none");
            const group1 = group = svgInner.insert("g", "*")
                .attr("transform", d =>
                      `translate(0, ${headerHeight})`)
                .call(render, d.parent);

            x.domain([d.parent.x0, d.parent.x1]);
            y.domain([d.parent.y0, d.parent.y1]);

            group.transition()
                .duration(750)
                .call(t => group0.transition(t).remove()
                    .attrTween("opacity", () => d3.interpolate(1, 0))
                    .call(position, d))
                .call(t => group1.transition(t)
                    .call(position, d.parent));
        }

        //alert("pkgsTreeMap :: on | END");
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

    /*chart.width = function(_) {
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
    };*/

    return chart;
}


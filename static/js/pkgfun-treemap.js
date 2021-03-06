// Create a tree map of packages
function dataTreeMap() {
    let margin = {
          top: 0, right: 0, bottom: 0, left: 0
        },
        width = 260,
        height = 140,
        headerHeight = 17,
        footerHeight = 17,
        colorPalette = COLOR_PALETTE_BLUE,
        tmHeight = height - headerHeight - footerHeight;

    checkColorPalette(colorPalette);

    // selector  -- element with svg
    // dispatch  -- d3 dispatch
    // labels    -- header and footer labels
    // getters   -- data-specific getters
    // pullEvent -- name of the event to dispatch on
    function chart(selector, dispatch, labels, getters,
        pullEvent, dataEventHandlers
    ) {

        const getValue = tmGetValue;
        const getLogValue = d => Math.log2(getValue(d));
        const getName = d =>
            getters.hasName(d) ? getters.getName(d) : labels.moreData;
        const hasExtra = getters.hasExtra;
        const getExtra = d =>
            getters.hasName(d) ? getters.getExtra(d) : "";
        const hasChildren = tmHasChildren;

        const svg = d3.select(selector);

        dispatch.on(pullEvent, function(query, data) {
            data = getters.getData(data);
            data = deepCopy(data);
            //alert("pkgsTreeMap :: on | START");
            //console.log(data);

            // remove all data if there is noe
            svg.selectAll("g").remove();

            if (data.length == 0) {
                tmERROR("no data");
                return;
            }

            // Data preprocessing
            // ----------------------------------------
            const tmData = data2TreeMapData(data, colorPalette);
            //console.log(data);
            //console.log(tmData);

            // prepare data from hierarchial object/array
            const dataRoot = d3.hierarchy(tmData)
                .sum(getValue); // compute values for children // getLogValue
            // prepare treemap layout info
            applyTreeMapLayout(
                dataRoot,
                { width: width, height: tmHeight }
            );
            //console.log(dataRoot);

            // Basic chart components
            // ----------------------------------------

            const mkScale = _ => d3.scaleLinear();
            const x = mkScale().rangeRound([0, width]);
            const y = mkScale().rangeRound([0, tmHeight]);

            x.domain([0, width]);
            y.domain([0, tmHeight]);

            // svg for header+treemap+footer
            const svgInner = svg.append("g")
                .attr("transform",
                    `translate(${margin.left},${margin.top})`
                );
            // svg for treemap only
            const svgTreeMap = svgInner.append("g")
                .attr("transform",
                      `translate(0,${headerHeight})`
                );

            // text margins
            const headerMargin = {
                left: 2,
                top: 12
            };
            const blockMargin = {
                left: 2,
                top: 11
            };

            // header for all packages
            const headerGroup = svgInner.append("g");
            const headerRect = headerGroup.append("rect")
                .attr("class", "tm-header")
                .attr("fill", colorPalette.header)
                .attr("x", 0)
                .attr("y", 0)
                .attr("width", width)
                .attr("height", headerHeight);
            const headerText = headerGroup.append("text")
                .attr("class", "tm-header-text")
                .attr("x", headerMargin.left)
                .attr("y", headerMargin.top)
                .text(labels.title);

            // footer for "more" packages
            const footerGroup = svgInner.append("g");
            const footerRect = footerGroup.append("rect")
                .attr("class", "tm-footer")
                .attr("fill", colorPalette.footer)
                .attr("stroke", colorPalette.footer)
                .attr("x", 0)
                .attr("y", height - footerHeight)
                .attr("width", width)
                .attr("height", footerHeight);
            const footerText = footerGroup.append("text")
                .attr("class", "tm-footer-text")
                .attr("dx", headerMargin.left)
                .attr("dy", height - footerHeight + headerMargin.top)
                .text(labels.showMore);

            // selected nodes
            let selectionInfo = {
                datums: [],
                currNodes: []
            };

            let group = svgTreeMap.append("g");
            group.call(render, dataRoot);

            // Blocks' placement
            // ----------------------------------------

            // Prepare data as a tree map
            function render(group, root) {
                selectionInfo.currNodes = [];

                const node = group
                    .selectAll("g")
                    .data(root.children)
                    .join("g");

                node.filter(hasChildren)
                    .attr("cursor", "pointer")
                    .on("click", d => zoomin(d));

                node.filter(d => !hasChildren(d))
                    .attr("class", "tm-node")
                    .on(
                        "click",
                        dataEventHandlers.onclick.active ?
                            function(d) {
                                //d3.select(this).style("stroke", "black")
                                dataEventHandlers.onclick.handler(this, d,
                                    selectionInfo, dispatch, query);
                            } :
                            null
                    );

                // footer behaves as "..." node
                const childrenNode = root.children.find(hasChildren);
                footerGroup
                    //.style("opacity", childrenNode ? 1 : 0)
                    .on("click", childrenNode ? (_ => zoomin(childrenNode)) : null)
                    .attr("cursor", childrenNode ? "pointer" : "default")
                footerRect
                    .style("fill", childrenNode ? colorPalette.footer : "#f4f1f0")
                    .style("stroke", childrenNode ? colorPalette.footer : "#f4f1f0");

                headerGroup
                    .on("click", root.parent ? (_ => zoomout(root)) : null)
                    .attr("cursor", root.parent ? "pointer" : "default");
                headerText
                    .text(root.parent ? labels.titleMore : labels.title);

                node.append("title")
                    .text(d => `${getName(d.data)}\n${d3.format("~s")(d.value)}`);

                node.append("rect")
                    .attr("rx", 2)
                    .attr("ry", 2)
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
                    .text(d => d3.format("~s")(d.value));
                if (hasExtra) {
                    node.append("text")
                        .attr("class", "tm-block-text-small")
                        .attr("fill", d => d.data.color.font)
                        .attr("x", blockMargin.left)
                        .attr("y", blockMargin.top*3)
                        .text(d => getExtra(d.data));
                }

                // enable selected style for nodes if necessary
                //alert(selectionInfo.datums);
                node.filter(d => selectionInfo.datums.includes(d))
                    .each(function(d) {
                        dataEventHandlers.onselected(this, selectionInfo)
                    });

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
                const group1 = group = svgTreeMap.append("g")
                    .call(render, d);

                x.domain([d.x0, d.x1]);
                y.domain([d.y0, d.y1]);

                svgTreeMap.transition()
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
                const group1 = group = svgTreeMap.insert("g", "*")
                    .call(render, d.parent);

                x.domain([d.parent.x0, d.parent.x1]);
                y.domain([d.parent.y0, d.parent.y1]);

                svgTreeMap.transition()
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

    chart.colorPalette = function(_) {
        if (!arguments.length)
            return colorPalette;
        colorPalette = _;
        return chart;
    };

    /*chart.margin = function(_) {
        if (!arguments.length)
            return margin;
        margin = _;
        return chart;
    };*/

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
        tmHeight = height - headerHeight - footerHeight;
        return chart;
    };

    return chart;
}

// Create types overview chart. This is the main view in the visualization.
function typesOverviewChart() {
    let margin = {top: 10, right: 10, bottom: 10, left: 10},
        width = 800,
        height = 550,
        density = 6;

    function chart(selector, dispatch) {
        const svg = d3.select(selector);
        dispatch.on("pull.typesoverview", function(query, data) {
            svg.select("g").remove();

            // Setup
            const w = width - margin.left - margin.right,
                  h = height - margin.top - margin.bottom,
                  g = svg.append("g"),
                  brush = d3.brush(),
                  quadtree = d3.quadtree().x((d) => d.x).y((d) => d.y),
                  colors = makeScale(d3.schemePastel2, data);

            g.attr("transform", "translate(" + margin.left + "," + margin.top + ")");

            // Sankey config
            const sankey = d3.sankey()
                  .nodeAlign(d3.sankeyLeft)
                  .nodeWidth(2)
                  .extent([[0, dataKeys.length - 1], [w, h]]);

            // Wrangling data
            console.log(data);
            data = data.functions;
            data = sankeyData(data);
            const {nodes, links} = sankey(data);

            // Draw nodes
            g.selectAll("rect")
                .data(nodes)
                .join("rect")
                .attr("fill", "black")
                .attr("x", d => d.x0)
                .attr("y", d => d.y0)
                .attr("height", d => d.y1 - d.y0)
                .attr("width", d => d.x1 - d.x0);

            // Draw node labels
            let widths = [];
            g.selectAll("text.nodeLabel")
                .data(nodes)
                .enter()
                .append("text")
                .style("font", "10px sans-serif")
                .attr("fill", "black")
                .attr("x", d => d.x0 + 8)
                .attr("y", d => (d.y0 + d.y1) / 2)
                .text(d => d.name)
                .each(function(d) {
                    widths.push(this.getBBox().width);
                });

            // Draw node counts
            g.selectAll("text.nodeCount")
                .data(nodes)
                .enter()
                .append("text")
                .style("font", "8px sans-serif")
                .attr("fill", "grey")
                .attr("x", d => d.x0 + 10 + widths.shift())
                .attr("y", d => (d.y0 + d.y1) / 2)
                .text(d => " (" + d.value + ")");

            // Draw links
            const layout = d3.sankeyLinkHorizontal();
            const linkPaths =
                  g.selectAll("g")
                  .data(links)
                  .join("path")
                  .attr("d", layout)
                  .attr("fill", "none")
                  .attr("stroke", d => colors(d.target.name))
                  .attr("stroke-width", d => d.width)
                  .style("mix-blend-mode", "multiply");
            let reachableNodes = [];

            // Brushing
            linkPaths.each(function(d) {
                const pts = horizontalPoints(this, d, density, d.width);
                d.selected = false;
                quadtree.addAll(pts);
            });

            brush.on("start brush", function(){
                let [x, y] = d3.mouse(this);
                reachableNodes = [];
                if (d3.event.selection === null) return;
                const [[x0, y0], [x3, y3]] = d3.event.selection;
                linkPaths.each((d) => d.selected = false);
                quadtree
                    .extent(d3.event.selection)
                    .visit(function(node, x1, y1, x2, y2) {
                        if (!node.length) {
                            do {
                                let d = node.data;
                                if ((d.x >= x0) && (d.x < x3) && (d.y >= y0) && (d.y < y3)) {
                                    d.data.selected = true;
                                    if (!reachableNodes.includes(d.data.source)) {
                                        reachableNodes.push(d.data.source);
                                    }
                                }
                            } while (node = node.next);
                        }
                        return x1 >= x3 || y1 >= y3 || x2 < x0 || y2 < y0;
                    });

                // Find reachable nodes
                let neighbors = [];
                do {
                    neighbors = [];
                    for (link of data.links) {
                        if (reachableNodes.includes(link.target) && !reachableNodes.includes(link.source)) {
                            neighbors.push(link.source);
                            link.selected = true;
                        }
                    }
                    reachableNodes = reachableNodes.concat(neighbors);
                } while (neighbors.length > 0);

                // Color
                linkPaths.attr("stroke", function(d) {
                    let curColor = colors(d.target.name);
                    if (d.selected) {
                        return d3.color(curColor).darker(0.5);
                    } else {
                        return curColor;
                    }
                });
            });

            brush.on("end", function() {
                let reachableFunctions =
                    reachableNodes.filter((d) => d.depth === 0).map((d) => d.name);
                query.functions = reachableFunctions;
                dispatch.call("push", this, query);
            });
            g.call(brush);
        });
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

// These are the columns from the table that we will use for our visualization.
const dataKeys =
  ["fun_name", "arg_t0", "arg_t1", "arg_t2", "arg_t3", "arg_t4", "arg_t_r"];

// Main function for transforming the input data into something that is usable
// for the D3 Sankey library.
function sankeyData(data) {
    return sankeyTreeToNodeLink(sankeyDataToTree(data));
}

// Convert the raw data from the CSV into a format into a tree.
function sankeyDataToTree(data) {
    let root = { __value: 0 };

    // For every row in the dataset.
    for (const d of data) {
        let cur = root;
        for (const k of dataKeys) {
            // Don't generate a node for NA
            let v = d[k];
            if (!v || v === "NA") break;

            // Get existing node or generate new one and add function count
            let next = cur[v];
            if (!next) next = cur[v] = { __value: 0 };
            next.__value += parseInt(d.count);
            cur = next;
        }
    }
    return root;
}

// Turn the tree data structure into a node and link dictionary that the library
// understands.
function sankeyTreeToNodeLink(root) {
    let vs = [];
    let vsIndex = {};
    let es = [];
    let queue = [{ name: undefined, data: root, depth: 0 }];

    // Do a BFS over the tree to get flows connected correctly
    while (queue.length !== 0) {
        let cur = queue.shift();
        for (const k in cur.data) {
            // The metadata __value is not a child
            if (k === "__value") continue;
            let d = cur.depth + 1,
                v = { name: k, data: cur.data[k], depth: d },
                vAsJSON = JSON.stringify([k, d]),
                i = vsIndex[vAsJSON];

            // New type at this depth
            if (!i) {
                i = vsIndex[vAsJSON] = vs.length;
                vs.push(v);
            }
            queue.push(v);

            // Create link
            if (!cur.name) continue;
            es.push({ source: vsIndex[JSON.stringify([cur.name, cur.depth])],
                      target: i,
                      value: cur.data[k].__value });
        }
    }

    return { nodes: vs, links: es };
}

/* Generates points for the horizontal axis of a path. */
function horizontalPoints(path, data, density, width) {
    const total = path.getTotalLength(),
          numPoints = total / density;
    let pts = [];
    for (var i = 0; i <= numPoints + 1; ++i) {
        const interp = total * (i / numPoints);
        const pt = path.getPointAtLength(interp);
        const yRoot = pt.y - (width / 2);
        pts = pts.concat(verticalPoints(pt.x, yRoot, data, density, width));
    }
    return pts;
}

/* Generates points for the vertical axis of a path. */
function verticalPoints(xRoot, yRoot, data, density, width) {
    const total = width,
          numPoints = total / density;
    let pts = [];
    for (var i = 0; i <= numPoints + 1; ++i) {
        const interp = total * (i / numPoints);
        pts.push({x: xRoot, y: yRoot + interp, data: data});
    }
    return pts;
}

/* Generate scale from function names. */
function makeScale(scheme, data) {
    let types = new Set();
    for (fn of data.functions) {
        for (field of dataKeys) {
            types.add(fn[field]);
        }
    }
    return d3.scaleOrdinal(scheme).domain(types);
}

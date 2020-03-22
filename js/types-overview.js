// Create types overview chart. This is the main view in the visualization.
function typesOverviewChart() {
    let margin = {top: 20, right: 20, bottom: 20, left: 20},
        width = 550,
        height = 400;

    function chart(selector, dispatch) {
        dispatch.on("pull.typesoverview", function(query, data) {
            console.log(data);
            // Setup
            const w = width - margin.left - margin.right,
                  h = height - margin.top - margin.bottom,
                  svg = d3.select(selector),
                  g = svg.append("g");
            g.attr("transform", "translate(" + margin.left + "," + margin.top + ")");

            // Sankey config
            const sankey = d3.sankey()
                  .nodeAlign(d3.sankeyLeft)
                  .nodeWidth(2)
                  .extent([[0, dataKeys.length - 1], [w, h]]);

            // Wrangling data
            data = sankeyData(data);
            const {nodes, links} = sankey(data);

            // Draw nodes
            g.selectAll("rect")
                .data(nodes)
                .join("rect")
                .attr("x", d => d.x0)
                .attr("y", d => d.y0)
                .attr("height", d => d.y1 - d.y0)
                .attr("width", d => d.x1 - d.x0);

            // Draw node labels
            g.style("font", "10px sans-serif")
                .selectAll("text")
                .data(nodes)
                .join("text")
                .attr("x", d => d.x0 + 8)
                .attr("y", d => (d.y0 + d.y1) / 2)
                .text(d => d.name);

            // Draw links
            g.selectAll("g")
                .data(links)
                .join("path")
                .attr("d", d3.sankeyLinkHorizontal())
                .attr("fill", "none")
                .attr("stroke", "#c39bd3")
                .attr("stroke-width", d => d.width)
                .style("mix-blend-mode", "multiply");
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
const dataKeys = ["fun_name", "arg_t0", "arg_t1", "arg_t2", "arg_t3", "arg_t4"];

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

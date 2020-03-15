function typesOverviewChart() {
    let margin = {top: 20, right: 20, bottom: 20, left: 20},
        width = 550,
        height = 400;

    function chart(selector, data) {
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
        console.log(data);
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

const dataKeys = ["fun_name", "arg_t1", "arg_t2", "arg_t3", "arg_t4"];

function sankeyData(data) {
    return sankeyTreeToNodeLink(sankeyDataToTree(data));
}

function sankeyDataToTree(data) {
    let root = { __value: 0 };
    for (const d of data) {
        let cur = root;
        for (const k of dataKeys) {
            let v = d[k];
            // TODO: Ok to ignore NA like this?
            if (!v || v === "NA") break;

            let next = cur[v];
            if (!next) next = cur[v] = { __value: 0 };
            next.__value += parseInt(d.count);
            cur = next;
        }
    }
    return root;
}

function sankeyTreeToNodeLink(root) {
    let vs = [];
    let vsIndex = {};
    let es = [];
    let queue = [{ name: undefined, data: root, depth: 0 }];

    while (queue.length !== 0) {
        let cur = queue.shift();
        for (const k in cur.data) {
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

// **************************************************
// Utilities for TreeMap visualizations
// **************************************************

// Helper for debugging
function tmERROR(msg) {
    alert(`ERROR | ${msg}`);
}

// ==================================================
// Data processing
// ==================================================

// Transforms source data into the format
// suitable for the TreeMap layout processing
function data2TreeMapData(data, colorPalette) {
    
    // helper functions
    // ------------------------------

    // adds color info to the element
    function mkDataElem(d, i) {
        // background and font color
        d.color = {
            background: colorPalette.background[i],
            font: colorPalette.font[i]
        };
        return d;
    }

    function foldData(currLevel) {
        const getCount = d => d.count;
        const getLogCount = d => Math.log2(d.count);
        for (let i = 1; i < currLevel.length; i++) {
            const needsBreak = 
                //chunk is too big
                (i == colorPalette.length) ||
                // sizes are too different
                //(currLevel[i-1].count / currLevel[i].count) > 6;
                (getCount(currLevel[0]) / getCount(currLevel[i])) > 6;
            if (needsBreak) {
                let innerLevel = currLevel.slice(i);
                innerLevel = foldData(innerLevel);
                let newCurrLevel = currLevel.slice(0, i);
                newCurrLevel.map((d, i) => mkDataElem(d, i));
                //console.log({foo: newCurrLevel});
                newCurrLevel.push(
                    mkDataElem({
                        hasMore: true,
                        children: innerLevel
                        }, colorPalette.length
                    )
                );
                return newCurrLevel;
            }
        }
        currLevel.map((d, i) => mkDataElem(d, i));
        return currLevel;
    }

    // data checking
    // ------------------------------

    // we should not work with empty data
    if (data.length == 0) {
        tmERROR("Data for TreeMap should not be empty");
    }

    // sort by count in descending order
    data.sort((d1, d2) => d2.count - d1.count);

    // make hierarchical data and return outer level
    // ------------------------------
    const currLevel = foldData(data);
    //console.log(currLevel);
    return {
        hasMore: true,
        children: currLevel
    };
}

// Applies TreeMap layout to hierarchical data [root]
function applyTreeMapLayout(root, params) {
    // basic layout
    const treeMapLayout = d3.treemap()
        .tile(d3.treemapSquarify.ratio(1)) // treemapBinary
        //.padding(1)
        .round(true)
        .size([params.width, params.height]);
    return treeMapLayout(root);
}

const tmHasChildren = d => d.children;
const tmGetValue = d => d.count;

const PKGS_GETTERS = {
    getData: data => data.packages,
    hasName: d => d.package,
    getName: d => d.package,
    hasExtra: false
};

const FUNCS_GETTERS = {
    getData: data => data.function_names, //data.functions,
    hasName: d => d.fun_name,
    getName: d => `${d.fun_name}`, //`${d.fun_name} (-> ${d.arg_t_r})`
    hasExtra: true,
    getExtra: d => `(${d.package})`
};

// ==================================================
// Color palettes
// ==================================================

// color-blind palette (from color brewer)
// #f7fcf0 #e0f3db #ccebc5 #a8ddb5 #7bccc4 #4eb3d3 #2b8cbe #0868ac #084081

const COLOR_DARK = "black";
const COLOR_LIGHT = "white";

const COLOR_PALETTE_BLUE = {
    length: 7,
    header: "#f7fcf0",
    footer: "#084081",
    background: [
        "#e0f3db", "#ccebc5", "#a8ddb5", "#7bccc4",
        "#4eb3d3", "#2b8cbe", "#0868ac", "#084081"
    ],
    font: [
        COLOR_DARK, COLOR_DARK, COLOR_DARK, COLOR_DARK, 
        COLOR_LIGHT, COLOR_LIGHT, COLOR_LIGHT, COLOR_LIGHT
    ]
};

const COLOR_PALETTE_VIOLET = {
    length: 7,
    header: "#f7fcfd",
    footer: "#4d004b",
    background: [
        "#e0ecf4", "#bfd3e6", "#9ebcda", "#8c96c6",
        "#8c6bb1", "#88419d", "#810f7c", "#4d004b"
    ],
    font: [
        COLOR_DARK, COLOR_DARK, COLOR_DARK, COLOR_DARK, 
        COLOR_LIGHT, COLOR_LIGHT, COLOR_LIGHT, COLOR_LIGHT
    ]
};

const COLOR_PALETTE_PINK = {
    length: 7,
    header: "#fff7f3",
    footer: "#49006a",
    background: [
        "#fde0dd", "#fcc5c0", "#fa9fb5", "#f768a1",
        "#dd3497", "#ae017e", "#7a0177", "#49006a"
    ],
    font: [
        COLOR_DARK, COLOR_DARK, COLOR_DARK, COLOR_DARK, 
        COLOR_LIGHT, COLOR_LIGHT, COLOR_LIGHT, COLOR_LIGHT
    ]
};

function checkColorPalette(colorPalette){
    if (colorPalette.background.length < colorPalette.length+1) {
        tmERROR("color palette size less than length");
    }
    if (colorPalette.background.length != colorPalette.font.length) {
        tmERROR("color palette sizes do not match");
    }
}

// ==================================================
// Labels
// ==================================================

const MORE_DATA_LABEL = "…";
const SHOW_MORE_DATA_LABEL = name => `🔍 more ${name}`; // [show more ${name}]
const TITLE_MORE_DATA_LABEL = name => `${name} ↩`; // [go back]

const PKGS_TITLE_LABEL  = "Packages";
const FUNCS_TITLE_LABEL = "Functions";

const PKGS_LABELS = {
    title:      PKGS_TITLE_LABEL,
    titleMore:  TITLE_MORE_DATA_LABEL(PKGS_TITLE_LABEL),
    moreData:   MORE_DATA_LABEL,
    showMore:   SHOW_MORE_DATA_LABEL(PKGS_TITLE_LABEL.toLowerCase())
};
//alert(pkgsLabels.titleMore);

const FUNCS_LABELS = {
    title:      FUNCS_TITLE_LABEL,
    titleMore:  TITLE_MORE_DATA_LABEL(FUNCS_TITLE_LABEL),
    moreData:   MORE_DATA_LABEL,
    showMore:   SHOW_MORE_DATA_LABEL(FUNCS_TITLE_LABEL.toLowerCase())
};

// ==================================================
// Events
// ==================================================

function nodeDisableSelection(node) {
    d3.select(node)//.selectAll("rect")
        .classed("tm-node-selected", false);
    d3.select(node).selectAll("rect")
        .classed("tm-node-selected", false)
        .attr("stroke-width", 0);
}

function nodeEnableSelection(node) {
    d3.select(node)//.selectAll("rect")
        .classed("tm-node-selected", true);
    d3.select(node).selectAll("rect")
        .classed("tm-node-selected", true)
        .attr("stroke", "white")
        .attr("stroke-width", 3);
}

function PKG_BLOCK_ONCLICK(node, d, selectionInfo, dispatch, query) {
    d.selected = d.selected ? false : true;
    if (d.selected) {
        // single selection
        if (!d3.select("#checkboxPkgMultiple").property("checked")) {
            selectionInfo.currNodes.map(nodeDisableSelection);
            selectionInfo.currNodes = [];
            selectionInfo.datums.map(
                d => (d.selected = false)
            );
            selectionInfo.datums = [];
        }
        nodeEnableSelection(node);
        selectionInfo.currNodes.push(node);
        selectionInfo.datums.push(d);
    }
    else {
        nodeDisableSelection(node);
        selectionInfo.currNodes = selectionInfo.currNodes.filter(
            _ => _ != node
        );
        selectionInfo.datums = selectionInfo.datums.filter(
            _ => _ != d
        );
    }
    const newQuery = {
        package_being_analyzed: query.package_being_analyzed,
        limit: query.limit,
        excluded: query.excluded,
        package: selectionInfo.datums.map(
            d => PKGS_GETTERS.getName(d.data)
        ),
        functions: []
    };
    //console.log(query);
    //alert(newQuery.packages);
    dispatch.call("funcs-push", this, newQuery, null);
    dispatch.call("push", this, newQuery, null);
}

function FUN_BLOCK_ONCLICK(node, d, selectionInfo, dispatch, query) {
    d.selected = d.selected ? false : true;
    if (d.selected) {
        //// single selection
        // single selection
        if (!d3.select("#checkboxFunMultiple").property("checked")) {
            selectionInfo.currNodes.map(nodeDisableSelection);
            selectionInfo.currNodes = [];
            selectionInfo.datums.map(
                d => (d.selected = false)
            );
            selectionInfo.datums = [];
        }
        nodeEnableSelection(node);
        selectionInfo.currNodes.push(node);
        selectionInfo.datums.push(d);
    }
    else {
        nodeDisableSelection(node);
        selectionInfo.currNodes = selectionInfo.currNodes.filter(
            _ => _ != node
        );
        selectionInfo.datums = selectionInfo.datums.filter(
            _ => _ != d
        );
    }
    const newQuery = deepCopy(query); 
    newQuery.functions = selectionInfo.datums.map(
                            d => d.data.fun_name
                         );
    //console.log(newQuery);
    //alert(query.packages);
    dispatch.call("push", this, newQuery, null);
}

const PKGS_EVENTS = {
    onclick: {
        active: true,
        handler: PKG_BLOCK_ONCLICK,
    },
    onselected: function(node, selectionInfo) {
        //alert(0);
        //console.log(node);
        nodeEnableSelection(node);
        selectionInfo.currNodes.push(node);
    }
};

const FUNCS_EVENTS = {
    onclick: {
        active: true,
        handler: FUN_BLOCK_ONCLICK,
    },
    onselected: function(node, selectionInfo) {
        //alert(0);
        //console.log(node);
        nodeEnableSelection(node);
        selectionInfo.currNodes.push(node);
    }
};


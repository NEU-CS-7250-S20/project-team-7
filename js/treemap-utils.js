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

    function cleanLevel(currLevel) {
        for (let i = 1; i < currLevel.length; i++) {
            if ((currLevel[i-1].count / currLevel[i].count) > 6) {
                let innerLevel = currLevel.slice(i);
                innerLevel = cleanLevel(innerLevel).level;
                let newCurrLevel = currLevel.slice(0, i);
                //console.log({foo: newCurrLevel});
                newCurrLevel.push(
                    mkDataElem({
                        hasMore: true,
                        children: innerLevel
                        }, colorPalette.length
                    )
                );
                return {level: newCurrLevel, changed: true};
            }
        }
        return {level: currLevel, changed: false};
    }

    // data checking
    // ------------------------------

    // we should not work with empty data
    if (data.length == 0) {
        tmERROR("Data for TreeMap should not be empty");
    }

    // sort by count in descending order
    data.sort((d1, d2) => d2.count - d1.count);

    // make hierarchical data
    // ------------------------------
    
    // 1) the remainder chunk with the smallest values
    let remainderNum = data.length % colorPalette.length;
    if (remainderNum == 0) // last chunk should not be empty
        remainderNum = data.length;

    // end-of-chunk pointer
    let iEnd = data.length;
    // start-of-chunk pointer
    let iStart = data.length - remainderNum;

    // 2) make remainder array
    let currLevel = data.slice(iStart, iEnd)
        .map(mkDataElem);
    currLevel = cleanLevel(currLevel).level;
    
    // 3) construct tree of all the elements,
    //    starting from the remainder chunk
    while (iStart != 0) {
        // move pointers to the previous chunk
        iEnd = iStart;
        iStart = iStart - colorPalette.length;
        // make an upper level
        let innerLevel = currLevel;
        currLevel = data.slice(iStart, iEnd)
            .map(mkDataElem);
        let cleanedCurrLevel = cleanLevel(currLevel);
        currLevel = cleanedCurrLevel.level;
        //console.log({index: iStart, data: cleanedCurrLevel});
        if (!cleanedCurrLevel.changed) {
            currLevel.push(mkDataElem({
                hasMore: true,
                children: innerLevel
            }, colorPalette.length));
        }
    }

    // 4) return the outer level
    return {
        hasMore: true,
        children: currLevel
    };
}

// Applies TreeMap layout to hierarchical data [root]
function applyTreeMapLayout(root, params) {
    // basic layout
    const treeMapLayout = d3.treemap()
        .tile(d3.treemapSquarify)
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
    getName: d => d.package
};

const FUNCS_GETTERS = {
    getData: data => data.functions,
    hasName: d => d.fun_name,
    getName: d => `${d.fun_name} (-> ${d.arg_t_r})`
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
const SHOW_MORE_DATA_LABEL = name => `[show more ${name}]`;
const TITLE_MORE_DATA_LABEL = name => `${name} [go back]`;

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
}

function nodeEnableSelection(node) {
    d3.select(node)//.selectAll("rect")
        .classed("tm-node-selected", true);
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
    query.package = selectionInfo.datums.map(
        d => PKGS_GETTERS.getName(d.data)
    );
    console.log(query);
    //alert(query.packages);
    dispatch.call("push", this, query, null);
}

function FUN_BLOCK_ONCLICK(node, d, selectionInfo, dispatch, query) {
    d.selected = d.selected ? false : true;
    if (d.selected) {
        //// single selection
        //if (!d3.select("#checkboxPkgMultiple").property("checked")) {
        selectionInfo.currNodes.map(nodeDisableSelection);
        selectionInfo.currNodes = [];
        selectionInfo.datums.map(
            d => (d.selected = false)
        );
        selectionInfo.datums = [];
        //}
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
    query.functions = selectionInfo.datums.map(
        d => FUNCS_GETTERS.getName(d.data)
    );
    //alert(query.packages);
    dispatch.call("push", this, query, null);
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
    }
};


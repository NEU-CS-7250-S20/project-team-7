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
        currLevel.push(mkDataElem({
            hasMore: true,
            children: innerLevel
        }, colorPalette.length));
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
    hasName: d => d.package,
    getName: d => d.package
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

const PKGS_TITLE_LABEL = "Packages";

const PKGS_LABELS = {
    title:      PKGS_TITLE_LABEL,
    titleMore:  TITLE_MORE_DATA_LABEL(PKGS_TITLE_LABEL),
    moreData:   MORE_DATA_LABEL,
    showMore:   SHOW_MORE_DATA_LABEL(PKGS_TITLE_LABEL.toLowerCase())
};
//alert(pkgsLabels.titleMore);

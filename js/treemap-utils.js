// **************************************************
// Utilities for TreeMap visualizations
// **************************************************

// Helper for debugging
function tmERROR(msg) {
    alert(`ERROR | ${msg}`);
}

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
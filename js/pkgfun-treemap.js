// Create a tree map of packages and functions
function pkgFunTreeMap() {
    let margin = {
          top: 20, right: 20, bottom: 20, left: 20
        },
        width = 600,
        height = 600;

    function chart(selector, data) {
        

    }

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


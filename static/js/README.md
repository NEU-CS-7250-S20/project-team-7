# JavaScript Code of Visualization

* [`visualization.js`](visualization.js) is the main file of the visualization.
  It initializes dispatch and all the charts, and sets up their interaction.  

* [`types-overview.js`](types-overview.js) implements
  the alluvial (aka Sankey) diagram from the "Types Overview" panel.
  It uses [`../lib/d3-sankey.js`](../lib/d3-sankey.js) file.

* [`package-filter.js`](package-filter.js) implements the "Analyzed Packages"
  panel, which provides filtering by analyzed packages.

* [`pkgfun-treemap.js`](pkgfun-treemap.js)
  and [`treemap-utils.js`](treemap-utils.js) implement the interactive treemaps
  for filtering by definition packages and defined functions.

* [`bar-chart.js`](bar-chart.js) implements the bar chart of the most popular
  function call signatures.

* [`vis-dom.js`](vis-dom.js) provides helper constants and functions
  for interacting with DOM-elements of the visualization.

* [`utils.js`](utils.js) contains general helper functions.

*Note.* We use [Reusable Charts](https://bost.ocks.org/mike/chart/) framework
by Mike Bostock and [d3-dispatch](https://github.com/d3/d3-dispatch).
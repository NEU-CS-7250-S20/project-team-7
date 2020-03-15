((() => {

    typesOverview = typesOverviewChart();

    d3.csv("../data/tiny.csv")
        .then((d) => typesOverview("#vis-svg-1", d));

})());

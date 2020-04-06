// **************************************************
// DOM definitions and helpers
// for visualization components
// **************************************************

// ==================================================
// Elements
// ==================================================

// ----------------------------------------
// Analysis Info
// ----------------------------------------

// ----------------------------------------
// Visualization Settings
// ----------------------------------------

const limitText = d3.select("#textSelectionsNum");
const excludedText = d3.select("#textPackagesExclude");

// ----------------------------------------
// Function Selection
// ----------------------------------------

// ----------------------------------------
// Types Overview
// ----------------------------------------

// ----------------------------------------
// Analyzed Packages Filter
// ----------------------------------------

const analyzedAllCheckbox = d3.select("#checkboxAnalyzedAll");

const analyzedPkgText = d3.select("#textAnalyzedPackage");
const analyzedPkgButtonSelect = d3.select("#buttonAnalyzedPackageSelect");
const analyzedPkgButtonUnselect = d3.select("#buttonAnalyzedPackageUnselect");
const analyzedMultipleCheckbox = d3.select("#checkboxAnalyzedMultiple");

// by default, multiple packages can be selected
analyzedMultipleCheckbox
    .property("checked", true);

// ----------------------------------------
// Packages/Functions TreeMaps
// ----------------------------------------

// ----------------------------------------
// BarChart
// ----------------------------------------

// ==================================================
// Functions
// ==================================================

// ----------------------------------------
// Analyzed Packages Filter
// ----------------------------------------

function getAnalyzedPkgName() {
    return analyzedPkgText.property("value");
}

function checkAnalyzedPkgName(pkgName, analyzedPkgs) {
    if (pkgName == "") {
        visERROR("Package name cannot be empty");
        return false;
    }
    if (!analyzedPkgs.includes(pkgName)) {
        visERROR("Unknown package being analyzed");
        return false;
    }
    return true;
}

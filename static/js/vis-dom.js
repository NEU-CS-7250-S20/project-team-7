// **************************************************
// DOM definitions and helpers
// for visualization components
// **************************************************

// ==================================================
// Elements
// ==================================================

const loaderElem = d3.select(".loader");

// ----------------------------------------
// Analysis Info
// ----------------------------------------

// ----------------------------------------
// Visualization Settings
// ----------------------------------------

const limitText = d3.select("#textSelectionsNum");
const limitButton = d3.select("#buttonSelectionsNum");

const excludedText = d3.select("#textPackagesExclude");
const excludedButton = d3.select("#buttonPackagesExclude");

// ----------------------------------------
// Function Selection
// ----------------------------------------

const funNameText = d3.select("#textFunctionName");
const funNameButton = d3.select("#buttonFunctionName");
const funNameClearButton = d3.select("#buttonClearFunctionName");
const funNameCheckbox = d3.select("#checkboxKeepFunction");

// No function is selected initially
funNameText.property("value", "");
// We are not keeping a function
funNameCheckbox.property("checked", false);
funNameCheckbox.property("disabled", true);

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

function disableLoader() {
    loaderElem.style("display", "none");
}
function enableLoader() {
    loaderElem.style("display", "block");
}

// ----------------------------------------
// Function Selection
// ----------------------------------------

function getFunctionName() {
    return funNameText.property("value");
}

function checkAndGetFunctionNameParams(funNameSelect) {
    const selectionElems = funNameSelect.split(" ")
        .filter(s => s != "");
    if (selectionElems.length == 0) {
        visERROR("Function name cannot be empty");
        return false;
    }
    if (selectionElems.length > 2) {
        visERROR("Function name cannot have more than 2 components");
        return false;
    }
    return selectionElems;
}

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

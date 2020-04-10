// **************************************************
// JavaScript helpers
// **************************************************

// Object -> Object
// Returns a deep copy of the arguments
const deepCopy =
    obj => JSON.parse(JSON.stringify(obj));

function visERROR(msg) {
    alert(`ERROR | ${msg}`);
}

function d3ElemIsChecked(elem) {
    return elem.property("checked");
}

function d3ElemMakeChecked(elem) {
    if (!d3ElemIsChecked(elem)) {
        elem.property("checked", true);
        elem.dispatch("change");
        return true;
    }
    return false;
}
function d3ElemMakeUnchecked(elem) {
    if (d3ElemIsChecked(elem)) {
        elem.property("checked", false);
        elem.dispatch("change");
        return true;
    }
    return false;
}

function d3ElemEnable(elem) {
    elem.property("disabled", false);
}
function d3ElemDisable(elem) {
    elem.property("disabled", true);
}
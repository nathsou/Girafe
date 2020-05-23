function isFun(term) {
    return typeof term === "object";
}
function isVar(term) {
    return typeof term === "string";
}
function showTerm(term) {
    if (isVar(term)) return term;
    if (term.args.length === 0) return term.name;
    return term.name + '(' + term.args.map(showTerm).join(', ') + ');
}

function grf__plus_(v1, v2) {
    switch (isFun(v1) ? v1.name : null) {
        case S:
            return S(grf__plus_(v1.args[0], v2));
        default:
            return { name: "grf__plus_", args: [v1, v2] };
    }
}

import { Rule, Term, TRS } from "../../Parser/Types";
import { Maybe } from "../Utils";
import { Matcher } from "../Matcher";
export declare class TermMatcher {
    private root;
    constructor(trs: TRS);
    private init;
    private termName;
    private insert;
    private lookupArgs;
    lookup(term: Term): Maybe<Rule[]>;
    asMatcher(): Matcher;
}

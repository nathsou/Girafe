import { fun, decons, isFun } from "../Compiler/Utils";
import { Term, Fun, JSExternals } from "../Parser/Types";
import { symb } from "./Arithmetic";
import { mapMut } from "../Parser/Utils";

export const listOf = (elems: Term[]): Term => {
    if (elems.length === 0) return symb('Nil');
    const [h, tl] = decons(elems);
    return fun(':', h, listOf(tl));
};

const splitHead = (t: Fun) => {
    const n = t.args[0];
    if (isFun(n)) {
        return listOf(mapMut(n.name.split(''), symb));
    }

    return t;
};

export type ListExternals = 'splitHead';

export const listExternals: JSExternals<ListExternals> = {
    'splitHead': splitHead
};
import { editor as monacoEditor } from 'monaco-editor';
///@ts-ignore
import trs from "../../examples/test.grf";
import { TermMatcher } from "../Evaluator/Matchers/TermMatcher/TermMatcher";
import { DecisionTreeMatcher } from "../Evaluator/Matchers/DecisionTreeMatcher";
import {
    fun,
    isNothing,
    showRule,
    showTerm,
    uniq,
    vars,
    defaultPasses
} from "../Compiler/Utils";
import { compileRules, reduce } from "../Evaluator/Unification";
import { time } from "../Parser/Utils";
import { JSExternals } from "../Parser/Types";
import { arithmeticExternals } from "../Externals/Arithmetic";
import { listExternals } from "../Externals/Lists";
import { FileReader } from "../Parser/Preprocessor/Import";
import { parseTerm } from '../Parser/Parser';

document.body.style.margin = "0px";
document.body.style.padding = "0px";
document.body.style.overflow = "hidden";
document.body.style.backgroundColor = "black";

const externals: JSExternals<string> = {
    ...arithmeticExternals,
    ...listExternals,
};

function h<K extends keyof HTMLElementTagNameMap>(
    name: K,
    props: Partial<HTMLElementTagNameMap[K]> = {},
    style: Partial<CSSStyleDeclaration> = {},
): HTMLElementTagNameMap[K] {
    const el = document.createElement(name);

    for (const [prop, value] of Object.entries(style)) {
        el.style[prop] = value;
    }

    for (const [prop, value] of Object.entries(props)) {
        el[prop] = value;
    }

    return el;
}

const div = (
    style: Partial<CSSStyleDeclaration>,
    ...children: HTMLElement[]
) => {
    const d = h("div", {}, style);

    for (const child of children) {
        d.appendChild(child);
    }

    return d;
};

const editorDiv = div({ width: "100vw", height: "80vh" });
document.body.appendChild(editorDiv);

const editor = monacoEditor.create(editorDiv, {
    value: trs,
    language: "plaintext",
    fontSize: 20,
    theme: "hc-dark",
});

const query = h("input", {
    type: "text",
    placeholder: "IsPrime(1789)",
}, {
    fontSize: "26px",
    width: editorDiv.style.width,
});

document.body.appendChild(query);

const outputDiv = div({ width: "100vw", height: "10vh" });
document.body.appendChild(outputDiv);

const output = monacoEditor.create(outputDiv, {
    value: "",
    language: "plaintext",
    fontSize: 20,
    theme: "vs-dark",
    lineNumbers: "off",
    minimap: { enabled: false },
});

const defaultFileReader: FileReader = async (path: string) => {
    ///@ts-ignore
    const dep = await import(`../../examples/${path}`);
    return dep.default;
};

const run = async () => {
    const querySymb = "___query";
    const queryT = parseTerm(query.value);
    if (isNothing(queryT)) return;
    const queryVars = uniq(vars(queryT));
    const queryLhs = fun(querySymb, ...queryVars);
    const queryRule = showRule([queryLhs, queryT]);
    const source = `${editor.getValue()}\n${queryRule}`;

    const trs = await compileRules(source, defaultPasses, defaultFileReader);
    if (isNothing(trs)) return;

    const matcher = new TermMatcher(trs).asMatcher();
    const dtMatcher = new DecisionTreeMatcher(trs);
    console.log(dtMatcher);

    const [delta, nf] = time(() => reduce(queryLhs, externals, matcher));

    const out = showTerm(nf);
    output.setValue(out);
    console.log(out);
    console.log(`took ${delta} ms`);
};

query.addEventListener("keypress", async (e: KeyboardEvent) => {
    if (e.keyCode === 13) {
        await run();
    }
});

window.addEventListener("resize", () => {
    editor.layout();
    output.layout();
});

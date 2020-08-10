// ts-ignore comments are used to load files that
// typescript does not know how to handle
/* eslint-disable @typescript-eslint/ban-ts-comment */
import * as monaco from 'monaco-editor';
///@ts-ignore
import trs from "../../examples/test.grf";
import {
    defaultPasses, fun,
    isNothing,
    showRule,
    showTerm,
    uniq,
    vars
} from "../Compiler/Utils";
import { arithmeticExternals } from "../Externals/Arithmetic";
import { listExternals } from "../Externals/Lists";
import { metaExternals } from "../Externals/Meta";
import { DecisionTreeNormalizer } from "../Normalizer/DecisionTreeNormalizer";
import { compileRules } from "../Normalizer/Unification";
import { parseTerm } from '../Parser/Parser';
import { FileReader } from "../Parser/Preprocessor/Import";
import { JSExternals } from "../Parser/Types";
import { time } from "../Parser/Utils";
import { girafeMonarch } from './syntax';

const importPath = '../../examples';

document.body.style.margin = "0px";
document.body.style.padding = "0px";
document.body.style.overflow = "hidden";

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

monaco.languages.register({ id: 'girafe' });
monaco.languages.setMonarchTokensProvider('girafe', girafeMonarch);

const editor = monaco.editor.create(editorDiv, {
    value: trs,
    language: "girafe",
    fontSize: 20
});

const hour = new Date().getHours();
let darkMode = hour >= 20 || hour <= 9;
monaco.editor.setTheme(darkMode ? 'vs-dark' : 'vs');

const toggleDarkMode: monaco.editor.IActionDescriptor = {
    id: 'toggleDarkMode',
    label: 'Toggle Dark Mode',
    keybindings: [
        monaco.KeyMod.CtrlCmd | monaco.KeyCode.KEY_K,
    ],
    run: () => {
        darkMode = !darkMode;
        monaco.editor.setTheme(darkMode ? 'vs-dark' : 'vs');
    }
};

editor.addAction(toggleDarkMode);

const query = h("input", {
    type: "text",
    placeholder: "IsPrime(1789)",
}, {
    fontSize: "26px",
    width: editorDiv.style.width,
});

document.body.appendChild(query);

const outputDiv = div({ width: "100vw", height: "calc(20vh - 37px)" });
document.body.appendChild(outputDiv);

const output = monaco.editor.create(outputDiv, {
    value: "",
    language: "girafe",
    fontSize: 20,
    lineNumbers: "off",
    minimap: { enabled: false },
    wordWrap: "on"
});

const defaultFileReader: FileReader = async (path: string) => {
    ///@ts-ignore
    const dep = await import(`${importPath}/${path}`);
    return dep.default;
};

const traceLogger = (): [(t: string) => void, string[]] => {
    const trace: string[] = [];

    return [(t: string): void => {
        trace.push(t);
        console.log(t);
    }, trace];
};

const log = (msg: string): void => {
    output.setValue(msg);
    console.log(msg);
};

const makeExternals = (): [JSExternals, string[]] => {
    const [log, trace] = traceLogger();
    return [{
        ...arithmeticExternals,
        ...listExternals,
        ...metaExternals(log)
    }, trace];
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

    const [externals, trace] = makeExternals();
    const normalize = new DecisionTreeNormalizer(trs).asNormalizer(externals);

    const [delta, nf] = time(() => normalize(queryLhs));
    const out = showTerm(nf);

    if (trace.length > 0) {
        output.setValue(trace.join('\n'));
    } else {
        log(out);
    }

    console.log(`took ${delta} ms`);
};

query.addEventListener("keypress", async (e: KeyboardEvent) => {
    if (e.keyCode === 13) { // Enter
        await run();
    }
});

window.addEventListener("resize", () => {
    editor.layout();
    output.layout();
});

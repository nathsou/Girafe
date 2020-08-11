// ts-ignore comments are used to load files that
// typescript does not know how to handle
/* eslint-disable @typescript-eslint/ban-ts-comment */
import * as monaco from 'monaco-editor';
///@ts-ignore
import trs from "../../examples/test.grf";
import {
    isNothing,

    showTerm
} from "../Compiler/Utils";
import { arithmeticExternals } from '../Externals/Arithmetic';
import { listExternals } from '../Externals/Lists';
import { metaExternals } from '../Externals/Meta';
import { normalizeQuery } from '../Normalizer/Normalizer';
import { parseTerm } from '../Parser/Parser';
import { JSExternals } from '../Parser/Types';
import { girafeMonarch } from './syntax';

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

const log = (msg: string): void => {
    output.setValue(msg);
    console.log(msg);
};

const traceLogger = (): [(t: string) => void, string[]] => {
    const trace: string[] = [];

    return [(t: string): void => {
        trace.push(t);
        console.log(t);
    }, trace];
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
    const queryT = parseTerm(query.value);
    if (isNothing(queryT)) return;

    const [externals, trace] = makeExternals();
    const res = await normalizeQuery(queryT, editor.getValue(), externals);
    if (isNothing(res)) return;

    const out = showTerm(res.normalForm);

    if (trace.length > 0) {
        output.setValue(trace.join('\n'));
    } else {
        log(out);
    }

    console.log(`took ${res.duration} ms`);
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

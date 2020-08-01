import * as monaco from 'monaco-editor';

export const girafeMonarch: monaco.languages.IMonarchLanguage = {
    // Set defaultToken to invalid to see what you do not tokenize yet
    defaultToken: 'invalid',
    tokenPostfix: '.grf',

    // The main tokenizer for our languages
    tokenizer: {
        root: [
            [/[\\(\\)]/, 'delimiter.bracket'],
            { include: 'common' }
        ],

        common: [
            [/\\->/, 'operator'],
            // variables
            [/[a-z_$][\w$]*/, 'variable'],
            // fun
            [/[A-Z0-9\\.\-\\~\\+\\*\\&\\|\\^\\%\\°\\$\\@\\#\\;\\:\\_\\=\\'\\>\\<\\/\\!\\&]+[A-Za-z0-9\\.\-\\~\\+\\*\\&\\|\\^\\%\\°\\$\\@\\#\\;\\:\\_\\=\\'\\>\\<\\/\\!\\&]*/, 'type.constructor'],  // to show class names nicely
            // [/[A-Z][\w\$]*/, 'identifier'],

            // whitespace
            { include: '@whitespace' },

            // delimiters and operators
            [/[()\\[\]]/, '@brackets'],
            [/,/, 'delimiter'],

            // strings
            [/"([^"\\]|\\.)*$/, 'string.invalid'],  // non-teminated string
            [/'([^'\\]|\\.)*$/, 'string.invalid'],  // non-teminated string
            [/"/, 'string', '@string_double']
        ],

        whitespace: [
            [/[ \t\r\n]+/, ''],
            [/\/\*/, 'comment', '@comment'],
            [/\/\/.*$/, 'comment'],
        ],

        comment: [
            [/[^\\/*]+/, 'comment'],
            [/\*\//, 'comment', '@pop'],
            [/[\\/*]/, 'comment']
        ],

        string_double: [
            [/[^\\"]+/, 'string'],
            [/"/, 'string', '@pop']
        ],

        bracketCounting: [
            [/\{/, 'delimiter.bracket', '@bracketCounting'],
            [/\}/, 'delimiter.bracket', '@pop'],
            { include: 'common' }
        ],
    },
};
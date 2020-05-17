/* lexical grammar */
%lex

%%
\s+                   /* skip whitespace */
[a-z][a-zA-Z0-9]*     return 'VAR';
"("                   return '(';
")"                   return ')';
","                   return ',';
"->"                  return '->';
"?"                  return '?';
[\.\-\~\+\*\/\\\&\|\^\%\°\$\@\#\£\€\;\:\_\=\'\>\<A-Z0-9]+[a-zA-Z0-9\']* return 'SYMB';
<<EOF>>               return 'EOF';

/lex

%start e

%% /* language grammar */

e: 
    rules EOF { return $rules; }
    | term EOF { return $term; }
    ;

rules:
    rule { $$ = [$1]; }
    | rules rule { $rules.push($rule); }
    ;

rule:
    term '->' term { $$ = [$1, $3]; }
    ;

term:
    VAR { $$ = yytext; }
    | fun { $$ = $fun; }
    | term '?' { $$ = { name: "Lazy", args: [$term] }; }
    ;
terms:
    term { $$ = [$1]; }
    | terms ',' term { $terms.push($term); }
    ;
    
fun:
    SYMB { $$ = { name: $1, args: [] }; }
    | SYMB '(' terms ')' { $$ = { name: $1, args: $3 }; }
    ;
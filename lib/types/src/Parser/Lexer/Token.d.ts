export declare type Token = VarToken | SymbToken | LeftParenToken | RightParenToken | CommaToken | LazyToken | ArrowToken;
export declare type PositionInfo = {
    line: number;
    col: number;
};
export declare type VarToken = {
    type: 'Var';
    name: string;
    position: PositionInfo;
};
export declare type SymbToken = {
    type: 'Symb';
    name: string;
    position: PositionInfo;
};
export declare type LeftParenToken = {
    type: '(';
    position: PositionInfo;
};
export declare type RightParenToken = {
    type: ')';
    position: PositionInfo;
};
export declare type CommaToken = {
    type: ',';
    position: PositionInfo;
};
export declare type LazyToken = {
    type: '?';
    position: PositionInfo;
};
export declare type ArrowToken = {
    type: '->';
    position: PositionInfo;
};

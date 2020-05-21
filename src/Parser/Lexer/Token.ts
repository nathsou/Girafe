
export type Token =
    | VarToken
    | SymbToken
    | LeftParenToken
    | RightParenToken
    | CommaToken
    | LazyToken
    | ArrowToken;

export type PositionInfo = {
    line: number;
    col: number;
};

export type VarToken = {
    type: 'Var',
    name: string,
    position: PositionInfo
};

export type SymbToken = {
    type: 'Symb',
    name: string,
    position: PositionInfo
};

export type LeftParenToken = {
    type: '(',
    position: PositionInfo
};

export type RightParenToken = {
    type: ')',
    position: PositionInfo
};

export type CommaToken = {
    type: ',',
    position: PositionInfo
};

export type LazyToken = {
    type: '?',
    position: PositionInfo
};

export type ArrowToken = {
    type: '->',
    position: PositionInfo
};
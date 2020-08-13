import { EmptyObject } from '../Types';

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

export type WithPos<S extends string, T = EmptyObject> = T & { type: S, position: PositionInfo };

export type VarToken = WithPos<'Var', { name: string }>;
export type SymbToken = WithPos<'Symb', { name: string }>;
export type LeftParenToken = WithPos<'('>;
export type RightParenToken = WithPos<')'>;
export type CommaToken = WithPos<','>;
export type LazyToken = WithPos<'?'>;
export type ArrowToken = WithPos<'->'>;
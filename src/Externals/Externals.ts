import { Fun, Term } from "../Parser/Types";
import { StepNormalizer } from "../Normalizer/Normalizer";

export type Targets = 'js' | 'ocaml' | 'haskell';
export const supportedTargets: Targets[] = ['js', 'ocaml', 'haskell'];

export type NativeExternals<Exts extends string = string> = {
    [name in Exts]: (t: Fun, normalizer: StepNormalizer, externals: NativeExternals<string>) => Term
};

export type AnyExternals<Exts extends string = string> = Externals<Targets, Exts> | NativeExternals<Exts>;

export type Externals<Target extends Targets, Exts extends string = string> = {
    [key in Exts]: (name: string) => string
};

export type ExternalsFactoryMap<Exts extends string = string> = {
    'native': NativeExternals<Exts>,
    'js': Externals<'js', Exts>,
    'ocaml': Externals<'ocaml', Exts>,
    'haskell': Externals<'haskell', Exts>
};

export type ExternalsFactory<Exts extends string> =
    <T extends Targets | 'native'>(target: T) => ExternalsFactoryMap<Exts>[T];

export const mergeExternals = (...factories: ExternalsFactory<string>[]): ExternalsFactory<string> => {
    return <T extends Targets | 'native'>(target: T) => {
        let exts = {};

        for (const factory of factories) {
            for (const [name, impl] of Object.entries(factory(target))) {
                exts[name] = impl;
            }
        }

        return exts;
    };
};
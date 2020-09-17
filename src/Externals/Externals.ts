import { Fun, Term } from "../Parser/Types";
import { StepNormalizer } from "../Normalizer/Normalizer";
import { SourceCode } from "../Translator/Translator";

export type Targets = 'js' | 'ocaml' | 'haskell';
export const supportedTargets: Targets[] = ['js', 'ocaml', 'haskell'];

export type NativeExternals<Exts extends string = string> = {
    [name in Exts]: (t: Fun, normalizer: StepNormalizer, externals: NativeExternals<string>) => Term
};

export type AnyExternals<Exts extends string = string> = Externals<Targets, Exts> | NativeExternals<Exts>;

export type Externals<Target extends string = Targets, Exts extends string = string> = {
    [key in Exts]: (name: string) => SourceCode
};


export type ExternalsFactoryMap<
    Exts extends string = string,
    Ts extends string = Targets
    > = {
        'native': NativeExternals<Exts>,
    } & { [target in Ts]: Externals<target, Exts> };

export type ExternalsFactory<Exts extends string = string, Ts extends string = Targets | 'native'> =
    <T extends Ts>(target: T) => ExternalsFactoryMap<Exts, Ts>[T];

export const mergeExternals = <Exts extends string, Ts extends string = Targets | 'native'>(
    ...factories: ExternalsFactory<Exts, Ts | 'native'>[]
): ExternalsFactory<Exts, Ts> => {
    return <T extends Ts | 'native'>(target: Ts) => {
        let exts = {} as ExternalsFactoryMap<Exts, Ts>[T];

        for (const factory of factories) {
            for (const [name, impl] of Object.entries(factory(target))) {
                exts[name] = impl;
            }
        }

        return exts;
    };
};
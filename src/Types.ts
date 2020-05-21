
export type Left_<L> = [L, 'left'];
export type Right_<R> = [R, 'right'];
export type Either<L, R> = Left_<L> | Right_<R>;
export type Result<T, E> = Either<T, E>;

// type constructors

export function Left<L, R>(value: L): Left_<L> {
    return [value, 'left'];
};

export const Ok = Left;

export function Right<L, R>(value: R): Right_<R> {
    return [value, 'right'];
};

export const Err = Right;

export function isLeft<L, R>(value: Either<L, R>): value is Left_<L> {
    return value[1] === 'left';
}

export const isOk = isLeft;

export function isRight<L, R>(value: Either<L, R>): value is Right_<R> {
    return value[1] === 'right';
}

export const isError = isRight;

// helpers

export function either<L, R, T>(
    value: Either<L, R>,
    onLeft: (value: L) => T,
    onRight: (value: R) => T
): T {
    return isLeft(value) ? onLeft(value[0]) : onRight(value[0]);
}

export function mapEither<L, R, T>(
    value: Either<L, R>,
    fn: (left: L) => T
): Either<T, R> {
    if (isLeft(value)) return Left(fn(unwrap(value)));
    return value;
}

type UnwrapReturnType<E extends Either<any, any>> =
    E extends Left_<infer L> ? L :
    E extends Right_<infer R> ? R :
    never;

export function unwrap<E extends Either<any, any>>([value, _]: E): UnwrapReturnType<E> {
    return value as UnwrapReturnType<E>;
}
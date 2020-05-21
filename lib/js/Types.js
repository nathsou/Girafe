"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.unwrap = exports.mapEither = exports.either = exports.isError = exports.isRight = exports.isOk = exports.isLeft = exports.Err = exports.Right = exports.Ok = exports.Left = void 0;
// type constructors
function Left(value) {
    return [value, 'left'];
}
exports.Left = Left;
;
exports.Ok = Left;
function Right(value) {
    return [value, 'right'];
}
exports.Right = Right;
;
exports.Err = Right;
function isLeft(value) {
    return value[1] === 'left';
}
exports.isLeft = isLeft;
exports.isOk = isLeft;
function isRight(value) {
    return value[1] === 'right';
}
exports.isRight = isRight;
exports.isError = isRight;
// helpers
function either(value, onLeft, onRight) {
    return isLeft(value) ? onLeft(value[0]) : onRight(value[0]);
}
exports.either = either;
function mapEither(value, fn) {
    if (isLeft(value))
        return Left(fn(unwrap(value)));
    return value;
}
exports.mapEither = mapEither;
function unwrap([value, _]) {
    return value;
}
exports.unwrap = unwrap;

'use strict';

import { ErrorCode } from './errorCode';

class CustomError extends Error {
    public errorCode: ErrorCode;

    public constructor(message: string, errorCode: ErrorCode) {
        super(message);

        this.name = name;
        this.errorCode = errorCode;
    }
}

export class InvalidInputError extends CustomError {
    public name = 'Invalid Input';
}

export class VisualizerError extends CustomError {
    public name = 'Failed to create the visualization';
}
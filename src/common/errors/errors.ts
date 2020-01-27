'use strict';

import { ErrorCode } from './errorCode';

export class ChartError extends Error {
    public errorCode: ErrorCode;

    public constructor(message: string, errorCode: ErrorCode) {
        super(message);

        this.name = name;
        this.errorCode = errorCode;
    }
}

export class InvalidInputError extends ChartError {
    public name = 'Invalid Input';
}

export class VisualizerError extends ChartError {
    public name = 'Failed to create the visualization';
}

export class EmptyPieError extends ChartError {
    public constructor() {
        super("The pie chart can't be drawn since it contains only empty data (zeros / null / undefined)", ErrorCode.EmptyPie);
    }
}
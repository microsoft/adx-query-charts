'use strict';

class CustomError extends Error {
    public constructor(message: string) {
        super(message);

        this.name = name;
    }
}

export class InvalidInputError extends CustomError {
    public name = 'Invalid Input';
}

export class VisualizerError extends CustomError {
    public name = 'Failed to create the visualization';
}
'use strict';

//#region Imports

import { AggregationType } from '../common/chartModels';

//#endregion Imports

export type IAggregationMethod = (valuesToAggregate: number[]) => number;

export class ChartAggregation {
    //#region Private members

    private static aggregationTypeToMethod: { [key in AggregationType]: IAggregationMethod } = {
        [AggregationType.Sum]: ChartAggregation.sum,
        [AggregationType.Average]: ChartAggregation.average,
        [AggregationType.Min]: ChartAggregation.minimum,
        [AggregationType.Max]: ChartAggregation.maximum
    };

    //#region Private members

    //#region Public methods

    public static getAggregationMethod(aggregationType: AggregationType): IAggregationMethod {
        const aggregationTypeToMethod = ChartAggregation.aggregationTypeToMethod;

        return aggregationTypeToMethod[aggregationType] || aggregationTypeToMethod[AggregationType.Sum];
    }

    //#endregion Public methods

    //#region Aggregation methods

    private static sum(values: number[]): number {
        let sum = 0;

        values.forEach((value: number) => {
            sum += value;
        });

        return sum;
    }

    private static average(values: number[]): number {
        const sum: number = ChartAggregation.sum(values);

        return sum / values.length;
    }

    private static minimum(values: number[]): number {
        return Math.min.apply(Math, values);
    }

    private static maximum(values: number[]): number {
        return Math.max.apply(Math, values);
    }

    //#endregion Aggregation methods
}
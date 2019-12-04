'use strict';

import { Chart } from './chart';
import { ChartTypeOptions, UNSTACKED } from '../chartTypeOptions';

export class Line extends Chart {
    //#region Methods override

    protected getChartTypeOptions(): ChartTypeOptions {
        return {
            chartType: 'line',
            plotOptions: {
                line:  {
                    stacking: UNSTACKED
                }
            }
        }
    }

    //#endregion Methods override
}
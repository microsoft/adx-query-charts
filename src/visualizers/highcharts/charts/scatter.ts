'use strict';

import { Chart } from './chart';
import { ChartTypeOptions, UNSTACKED } from '../chartTypeOptions';

export class Scatter extends Chart {
    //#region Methods override

    protected getChartTypeOptions(): ChartTypeOptions {
        return {
            chartType: 'scatter',
            plotOptions: {
                scatter:  {
                    stacking: UNSTACKED
                }
            }
        }
    }

    //#endregion Methods override
}
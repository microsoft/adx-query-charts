'use strict';

import { HighchartsChart } from './highchartsChart';
import { ChartTypeOptions, UNSTACKED } from '../chartTypeOptions';

export class Scatter extends HighchartsChart {
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
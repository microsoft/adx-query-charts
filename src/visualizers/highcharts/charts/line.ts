'use strict';

import { HighchartsChart } from './highchartsChart';
import { ChartTypeOptions, UNSTACKED } from '../chartTypeOptions';

export class Line extends HighchartsChart {
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
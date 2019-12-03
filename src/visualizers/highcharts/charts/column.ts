'use strict';

import { HighchartsChart } from './highchartsChart';
import { ChartTypeOptions } from '../chartTypeOptions';

export abstract class Column extends HighchartsChart {
    //#region Methods override

    protected getChartTypeOptions(): ChartTypeOptions {
        return {
            chartType: 'column',
            plotOptions: {
                column: {
                  stacking: this.getStackingOption()
                }
            }
        }
    }

    //#endregion Methods override

    protected abstract getStackingOption(): any;
}
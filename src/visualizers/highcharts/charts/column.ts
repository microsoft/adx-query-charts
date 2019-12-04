'use strict';

import { Chart } from './chart';
import { ChartTypeOptions } from '../chartTypeOptions';

export abstract class Column extends Chart {
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
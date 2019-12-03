'use strict';

import { HighchartsChart } from './highchartsChart';
import { ChartTypeOptions } from '../chartTypeOptions';

export abstract class Area extends HighchartsChart {
    //#region Methods override

    protected getChartTypeOptions(): ChartTypeOptions {
        return {
            chartType: 'area',
            plotOptions: {
                area:  {
                    stacking: this.getStackingOption()
                }
            }
        }
    }

    //#endregion Methods override

    protected abstract getStackingOption(): any;
}
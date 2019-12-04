'use strict';

import { Chart } from './chart';
import { ChartTypeOptions } from '../chartTypeOptions';

export abstract class Area extends Chart {
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
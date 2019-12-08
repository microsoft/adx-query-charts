'use strict';

import { Chart } from './chart';
import { UNSTACKED } from '../chartTypeOptions';

export class Scatter extends Chart {
    //#region Methods override

    protected getChartType(): string {
        return 'scatter';
    };

    protected plotOptions(): Highcharts.PlotOptions {
        return {
            scatter:  {
                stacking: UNSTACKED
            }
        }
    }

    //#endregion Methods override
}
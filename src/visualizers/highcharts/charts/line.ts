'use strict';

import { Chart } from './chart';
import { UNSTACKED } from '../chartTypeOptions';

export class Line extends Chart {
    //#region Methods override

    protected getChartType(): string {
        return 'line';
    };

    protected plotOptions(): Highcharts.PlotOptions {
        return {
            line:  {
                stacking: UNSTACKED
            }
        }
    }

    //#endregion Methods override
}
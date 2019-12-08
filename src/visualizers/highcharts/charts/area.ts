'use strict';

import { Chart } from './chart';

export abstract class Area extends Chart {
    //#region Methods override

    protected getChartType(): string {
        return 'area';
    };

    protected plotOptions(): Highcharts.PlotOptions {
        return {
            area:  {
                stacking: this.getStackingOption()
            }
        }
    }

    //#endregion Methods override

    protected abstract getStackingOption(): any;
}
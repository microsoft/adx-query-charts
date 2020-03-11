'use strict';

import { Chart } from './chart';

export abstract class Bar extends Chart {
    //#region Methods override

    protected getChartType(): string {
        return 'bar';
    };

    protected plotOptions(): Highcharts.PlotOptions {
        return {
            bar: {
              stacking: this.getStackingOption()
            }
        }
    }

    //#endregion Methods override

    protected abstract getStackingOption(): any;
}
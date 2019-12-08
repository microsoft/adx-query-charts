'use strict';

import { Chart } from './chart';

export abstract class Column extends Chart {
    //#region Methods override

    protected getChartType(): string {
        return 'column';
    };

    protected plotOptions(): Highcharts.PlotOptions {
        return {
            column: {
              stacking: this.getStackingOption()
            }
        }
    }

    //#endregion Methods override

    protected abstract getStackingOption(): any;
}
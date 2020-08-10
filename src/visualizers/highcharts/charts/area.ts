'use strict';

import { Chart } from './chart';
import { OptionsStackingValue } from 'highcharts';

export abstract class Area extends Chart {
    //#region Methods override

    protected getChartType(): string {
        return 'area';
    };

    protected plotOptions(): Highcharts.PlotOptions {
        return {
            area:  {
                stacking: this.getStackingOption(),
			    connectNulls: true
            }
        }
    }

    //#endregion Methods override

    protected abstract getStackingOption(): OptionsStackingValue;
}
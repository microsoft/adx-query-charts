'use strict';

import { Column } from './column';
import { PERCENTAGE } from '../chartTypeOptions';
import { OptionsStackingValue } from 'highcharts';

export class PercentageColumn extends Column {
    //#region Methods override

    protected getStackingOption(): OptionsStackingValue {
        return  PERCENTAGE;
    }

    //#endregion Methods override
}
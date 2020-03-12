'use strict';

import { Column } from './column';
import { STACKED } from '../chartTypeOptions';
import { OptionsStackingValue } from 'highcharts';

export class StackedColumn extends Column {
    //#region Methods override

    protected getStackingOption(): OptionsStackingValue {
        return  STACKED;
    }

    //#endregion Methods override
}
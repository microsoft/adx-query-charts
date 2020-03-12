'use strict';

import { Bar } from './bar';
import { STACKED } from '../chartTypeOptions';
import { OptionsStackingValue } from 'highcharts';

export class StackedBar extends Bar {
    //#region Methods override

    protected getStackingOption(): OptionsStackingValue {
        return  STACKED;
    }

    //#endregion Methods override
}
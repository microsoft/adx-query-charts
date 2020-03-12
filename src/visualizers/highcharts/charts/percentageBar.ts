'use strict';

import { Bar } from './bar';
import { PERCENTAGE } from '../chartTypeOptions';
import { OptionsStackingValue } from 'highcharts';

export class PercentageBar extends Bar {
    //#region Methods override

    protected getStackingOption(): OptionsStackingValue {
        return  PERCENTAGE;
    }

    //#endregion Methods override
}
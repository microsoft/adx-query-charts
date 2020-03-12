'use strict';

import { Bar } from './bar';
import { UNSTACKED } from '../chartTypeOptions';
import { OptionsStackingValue } from 'highcharts';

export class UnstackedBar extends Bar {
    //#region Methods override

    protected getStackingOption(): OptionsStackingValue {
        return  UNSTACKED;
    }

    //#endregion Methods override
}
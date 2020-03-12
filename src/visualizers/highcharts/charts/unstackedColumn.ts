'use strict';

import { Column } from './column';
import { UNSTACKED } from '../chartTypeOptions';
import { OptionsStackingValue } from 'highcharts';

export class UnstackedColumn extends Column {
    //#region Methods override

    protected getStackingOption(): OptionsStackingValue {
        return  UNSTACKED;
    }

    //#endregion Methods override
}
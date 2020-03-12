'use strict';

import { Area } from './area';
import { STACKED } from '../chartTypeOptions';
import { OptionsStackingValue } from 'highcharts';

export class StackedArea extends Area {
    //#region Methods override

    protected getStackingOption(): OptionsStackingValue {
        return  STACKED;
    }

    //#endregion Methods override
}
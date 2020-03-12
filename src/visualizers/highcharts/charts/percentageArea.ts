'use strict';

import { Area } from './area';
import { PERCENTAGE } from '../chartTypeOptions';
import { OptionsStackingValue } from 'highcharts';

export class PercentageArea extends Area {
    //#region Methods override

    protected getStackingOption(): OptionsStackingValue {
        return  PERCENTAGE;
    }

    //#endregion Methods override
}
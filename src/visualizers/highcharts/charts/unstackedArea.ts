'use strict';

import { Area } from './area';
import { UNSTACKED } from '../chartTypeOptions';
import { OptionsStackingValue } from 'highcharts';

export class UnstackedArea extends Area {
    //#region Methods override

    protected getStackingOption(): OptionsStackingValue {
        return  UNSTACKED;
    }

    //#endregion Methods override
}
'use strict';

import { Area } from './area';
import { PERCENTAGE } from '../chartTypeOptions';

export class PercentageArea extends Area {
    //#region Methods override

    protected getStackingOption(): any {
        return  PERCENTAGE;
    }

    //#endregion Methods override
}
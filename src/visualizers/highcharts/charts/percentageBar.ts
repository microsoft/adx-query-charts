'use strict';

import { Bar } from './bar';
import { PERCENTAGE } from '../chartTypeOptions';

export class PercentageBar extends Bar {
    //#region Methods override

    protected getStackingOption(): any {
        return  PERCENTAGE;
    }

    //#endregion Methods override
}
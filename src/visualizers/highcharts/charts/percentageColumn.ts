'use strict';

import { Column } from './column';
import { PERCENTAGE } from '../chartTypeOptions';

export class PercentageColumn extends Column {
    //#region Methods override

    protected getStackingOption(): any {
        return  PERCENTAGE;
    }

    //#endregion Methods override
}
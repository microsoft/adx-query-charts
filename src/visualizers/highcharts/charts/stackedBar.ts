'use strict';

import { Bar } from './bar';
import { STACKED } from '../chartTypeOptions';

export class StackedBar extends Bar {
    //#region Methods override

    protected getStackingOption(): any {
        return  STACKED;
    }

    //#endregion Methods override
}
'use strict';

import { Column } from './column';
import { STACKED } from '../chartTypeOptions';

export class StackedColumn extends Column {
    //#region Methods override

    protected getStackingOption(): any {
        return  STACKED;
    }

    //#endregion Methods override
}
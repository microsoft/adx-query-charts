'use strict';

import { Column } from './column';
import { UNSTACKED } from '../chartTypeOptions';

export class UnstackedColumn extends Column {
    //#region Methods override

    protected getStackingOption(): any {
        return  UNSTACKED;
    }

    //#endregion Methods override
}
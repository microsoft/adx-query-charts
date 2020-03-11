'use strict';

import { Bar } from './bar';
import { UNSTACKED } from '../chartTypeOptions';

export class UnstackedBar extends Bar {
    //#region Methods override

    protected getStackingOption(): any {
        return  UNSTACKED;
    }

    //#endregion Methods override
}
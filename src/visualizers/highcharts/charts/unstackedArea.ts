'use strict';

import { Area } from './area';
import { UNSTACKED } from '../chartTypeOptions';

export class UnstackedArea extends Area {
    //#region Methods override

    protected getStackingOption(): any {
        return  UNSTACKED;
    }

    //#endregion Methods override
}
'use strict';

import { Area } from './area';
import { STACKED } from '../chartTypeOptions';

export class StackedArea extends Area {
    //#region Methods override

    protected getStackingOption(): any {
        return  STACKED;
    }

    //#endregion Methods override
}
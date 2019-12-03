'use strict';

import { Pie } from './pie';

export class Donut extends Pie {
    //#region Methods override

    protected getInnerSize(): any {
        return  '40%';
    }

    //#endregion Methods override
}
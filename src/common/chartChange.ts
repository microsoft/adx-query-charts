'use strict';

export enum ChartChange {
    QueryData = 'QueryData',
    ColumnsSelection = 'ColumnsSelection',
    ChartType = 'ChartType'
}

export type ChangesMap = { [key in ChartChange]+?: boolean};

export class Changes {
    public changesMap: ChangesMap;
    public count: number;

    public constructor() {
        this.changesMap = {};
        this.count = 0;
    }

    public addChange(chartChange: ChartChange): void {
        this.changesMap[chartChange] = true;
        this.count++;
    }
}
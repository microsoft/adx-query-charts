'use strict';

export enum ChartChange {
    QueryData = 'QueryData',
    ColumnsSelection = 'ColumnsSelection',
    ChartType = 'ChartType',
    AggregationType = 'AggregationType'
}

export type ChangesMap = { [key in ChartChange]+?: boolean};

export class Changes {
    public count: number;
    private changesMap: ChangesMap;

    public constructor() {
        this.changesMap = {};
        this.count = 0;
    }

    public addChange(chartChange: ChartChange): void {
        this.changesMap[chartChange] = true;
        this.count++;
    }

    public isPendingChange(chartChange: ChartChange): boolean {
        return !!this.changesMap[chartChange];
    }
}
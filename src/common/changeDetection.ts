'use strict';

//#region Imports

import * as _ from 'lodash';
import { IQueryResultData, IChartOptions } from './chartModels';
import { ChartChange, Changes } from './chartChange';

//#endregion Imports

export class ChangeDetection {     
    public static detectChanges(oldQueryResultData: IQueryResultData, oldChartOptions: IChartOptions, newQueryResultData: IQueryResultData, newChartOptions: IChartOptions): Changes {
        if(!oldChartOptions) {
            return null; // First initialization
        }

        const changes: Changes = new Changes();

        if (oldQueryResultData !== newQueryResultData) {
            changes.addChange(ChartChange.QueryData);
        }

        if(ChangeDetection.isColumnsSelectionChanged(newChartOptions, oldChartOptions)) {
            changes.addChange(ChartChange.ColumnsSelection);

        }

        if(oldChartOptions.chartType !== newChartOptions.chartType) {
            changes.addChange(ChartChange.ChartType);
        }

        return changes;
    }

    private static isColumnsSelectionChanged(newChartOptions: IChartOptions, oldChartOptions: IChartOptions): boolean {
        const oldSelection = oldChartOptions.columnsSelection;
        const oldSelectedColumns = [oldSelection.xAxis].concat(oldSelection.yAxes).concat(oldSelection.splitBy || []);
        const newSelection = newChartOptions.columnsSelection;
        const newSelectedColumns = [newSelection.xAxis].concat(newSelection.yAxes).concat(newSelection.splitBy || []);

        if(oldSelectedColumns.length !== newSelectedColumns.length) {
            return true;
        }

        return !_.isEqual(_.sortBy(oldSelectedColumns, 'name'), _.sortBy(newSelectedColumns, 'name'));
    }
}
'use strict';

//#region Imports

import { ChartType, IChartOptions } from '../../../common/chartModels';
import { Chart } from './chart';
import { Line } from './line';
import { Scatter } from './scatter';
import { UnstackedArea } from './unstackedArea';
import { StackedArea } from './stackedArea';
import { PercentageArea } from './percentageArea';
import { UnstackedColumn } from './unstackedColumn';
import { StackedColumn } from './stackedColumn';
import { PercentageColumn } from './percentageColumn';
import { UnstackedBar } from './unstackedBar';
import { StackedBar } from './stackedBar';
import { PercentageBar } from './percentageBar';
import { Pie } from './pie';
import { Donut } from './donut';

//#endregion Imports

export class ChartFactory {
    public static create(chartType: ChartType, chartOptions: IChartOptions): Chart {
        switch (chartType) {
            case ChartType.Line: {
                return new Line(chartOptions);
            }
            case ChartType.Scatter: {
                return new Scatter(chartOptions);
            }
            case ChartType.UnstackedArea: {
                return new UnstackedArea(chartOptions);
            }
            case ChartType.StackedArea: {
                return new StackedArea(chartOptions);
            }
            case ChartType.PercentageArea: {
                return new PercentageArea(chartOptions);
            }
            case ChartType.UnstackedColumn: {
                return new UnstackedColumn(chartOptions);
            }
            case ChartType.StackedColumn: {
                return new StackedColumn(chartOptions);
            }
            case ChartType.PercentageColumn: {
                return new PercentageColumn(chartOptions);
            }
            case ChartType.UnstackedBar: {
                return new UnstackedBar(chartOptions);
            }
            case ChartType.StackedBar: {
                return new StackedBar(chartOptions);
            }
            case ChartType.PercentageBar: {
                return new PercentageBar(chartOptions);
            }
            case ChartType.Pie: {
                return new Pie(chartOptions);
            }
            case ChartType.Donut: {
                return new Donut(chartOptions);
            }
            default: {
                return new UnstackedColumn(chartOptions);
            }
        }
    }
}
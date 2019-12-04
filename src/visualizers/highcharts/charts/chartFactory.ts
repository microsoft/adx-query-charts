'use strict';

//#region Imports

import { ChartType } from '../../../common/chartModels';
import { IVisualizerOptions } from '../../IVisualizerOptions';
import { Chart } from './chart';
import { Line } from './line';
import { Scatter } from './scatter';
import { UnstackedArea } from './unstackedArea';
import { StackedArea } from './stackedArea';
import { PercentageArea } from './percentageArea';
import { UnstackedColumn } from './unstackedColumn';
import { StackedColumn } from './stackedColumn';
import { PercentageColumn } from './percentageColumn';
import { Pie } from './pie';
import { Donut } from './donut';

//#endregion Imports

export class ChartFactory {
    public static create(options: IVisualizerOptions): Chart {
        switch (options.chartOptions.chartType) {
            case ChartType.Line: {
                return new Line(options);
            }
            case ChartType.Scatter: {
                return new Scatter(options);
            }
            case ChartType.UnstackedArea: {
                return new UnstackedArea(options);
            }
            case ChartType.StackedArea: {
                return new StackedArea(options);
            }
            case ChartType.PercentageArea: {
                return new PercentageArea(options);
            }
            case ChartType.UnstackedColumn: {
                return new UnstackedColumn(options);
            }
            case ChartType.StackedColumn: {
                return new StackedColumn(options);
            }
            case ChartType.PercentageColumn: {
                return new PercentageColumn(options);
            }
            case ChartType.Pie: {
                return new Pie(options);
            }
            case ChartType.Donut: {
                return new Donut(options);
            }
            default: {
                return new UnstackedColumn(options);
            }
        }
    }
}
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
    public static create(chartType: ChartType): Chart {
        switch (chartType) {
            case ChartType.Line: {
                return new Line();
            }
            case ChartType.Scatter: {
                return new Scatter();
            }
            case ChartType.UnstackedArea: {
                return new UnstackedArea();
            }
            case ChartType.StackedArea: {
                return new StackedArea();
            }
            case ChartType.PercentageArea: {
                return new PercentageArea();
            }
            case ChartType.UnstackedColumn: {
                return new UnstackedColumn();
            }
            case ChartType.StackedColumn: {
                return new StackedColumn();
            }
            case ChartType.PercentageColumn: {
                return new PercentageColumn();
            }
            case ChartType.Pie: {
                return new Pie();
            }
            case ChartType.Donut: {
                return new Donut();
            }
            default: {
                return new UnstackedColumn();
            }
        }
    }
}
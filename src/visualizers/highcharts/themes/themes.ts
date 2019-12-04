'use strict';

import * as _ from 'lodash';
import * as Highcharts from 'highcharts';
import { ChartTheme } from '../../../common/chartModels';
import { DarkThemeOptions } from './darkTheme';
import { LightThemeOptions } from './lightTheme';

export class Themes {
    private static commonThemeTypeToHighcharts: { [key in ChartTheme]: Highcharts.Options; } = {
        [ChartTheme.Light]: LightThemeOptions,
        [ChartTheme.Dark]: DarkThemeOptions
    }

    private static defaultThemeOptions: Highcharts.Options = {
        title: {
            style: {
                fontSize: '20px'
            }
        },
        yAxis: {       
            tickWidth: 1,
        },
        plotOptions: {
            series: {
                dataLabels: {
                    style: {
                        fontSize: '13px'
                    }
                }
            }
        }
    };

    public static getThemeOptions(theme: ChartTheme): Highcharts.Options {
        const themeOptions = Themes.commonThemeTypeToHighcharts[theme];

        return _.merge({}, Themes.defaultThemeOptions, themeOptions);
    }
}
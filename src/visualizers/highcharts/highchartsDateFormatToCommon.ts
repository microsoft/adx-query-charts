'use strict';

import { DateFormat } from '../../common/chartModels';

// See: https://api.highcharts.com/highcharts/xAxis.dateTimeLabelFormats
export const HighchartsDateFormatToCommon = {
    '%H:%M:%S': DateFormat.FullTime,
    '%H:%M': DateFormat.HourAndMinute,
    '%e. %b': DateFormat.MonthAndDay,
    '%b \'%y': DateFormat.MonthAndYear,
    '%Y': DateFormat.Year
}
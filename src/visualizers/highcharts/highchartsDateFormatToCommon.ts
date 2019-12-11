'use strict';

import { DateFormat } from '../../common/chartModels';

// See: https://api.highcharts.com/highcharts/xAxis.dateTimeLabelFormats
export const HighchartsDateFormatToCommon = {
    '%H:%M:%S.%L': DateFormat.FullTime,
    '%H:%M:%S': DateFormat.Time,
    '%H:%M': DateFormat.HourAndMinute,
    '%e. %b': DateFormat.MonthAndDay,
    '%b \'%y': DateFormat.MonthAndYear,
    '%Y': DateFormat.Year
}
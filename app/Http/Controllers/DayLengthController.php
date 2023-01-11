<?php

namespace App\Http\Controllers;

use DateTime;
use Exception;
use Illuminate\Http\Request;

class DayLengthController extends Controller
{
    function dayLengthsOfCoordinates(Request $req)
    {
        $lat = $req->input("lat");
        //$long = $req->input("long");
        $timezone = 3;

        // Current year
        $year = date("Y");

        // Calculates how many days in this year, used for getting daytime length for each day
        $days = 0;
        for ($month = 1; $month <= 12; $month++) {
            $days = $days + cal_days_in_month(CAL_GREGORIAN, $month, $year);
        }

        $dayLengths = []; // Contains daytime lengths for all days in current year 

        // Loops through each day of year and calculates daytime length
        for ($i = 1; $i <= $days; $i++) {
            // Gets the month number from days
            $start_date = new DateTime("2022/01/01");
            $end_date = new DateTime(date("Y/m/d", strtotime("2022/01/01" . " + " . ($i - 1) . " days")));
            $dd = date_diff($end_date, $start_date);
            $month = $dd->m + 1;
            $day  = $dd->d;

            // Gets days from 1900-1-1 since excel uses this format
            $start = new DateTime('1900-1-1');
            $end = new DateTime($year . "-$month-" . $day);
            $interval = $start->diff($end);
            $excelFormattedDays = $interval->format('%a') + 2;

            $JD = $excelFormattedDays + 2415018.5 + 0 - $timezone / 24;
            $julian_century = ($JD - 2451545) / 36525;

            // array_push($dayLengths, $days);

            // Calculates how long a day is
            $geom_mean_anom = 357.52911 + $julian_century * (35999.05029 - 0.0001537 * $julian_century);
            $sun_eq_of_ctr = sin(deg2rad($geom_mean_anom)) * (1.914602 - $julian_century * (0.004817 + 0.000014 * $julian_century))
                + sin(deg2rad(2 * $geom_mean_anom)) * (0.019993 - 0.000101 * $julian_century)
                + sin(deg2rad(3 * $geom_mean_anom)) * 0.000289;
            $geom_mean_long_sun = fmod((280.46646 + $julian_century * (36000.76983 + $julian_century * 0.0003032)), 360.0);
            $sun_true_long = $geom_mean_long_sun + $sun_eq_of_ctr;
            $sun_app_long = $sun_true_long - 0.00569 - 0.00478 * sin(deg2rad(125.04 - 1934.136 * $julian_century));
            $mean_obliq_ecliptic = 23 + (26 + ((21.448 - $julian_century * (46.815 + $julian_century * (0.00059 - $julian_century * 0.001813)))) / 60) / 60;
            $obliq_corr = $mean_obliq_ecliptic + 0.00256 * cos(deg2rad(125.04 - 1934.136 * $julian_century));

            $sun_decl = rad2deg(asin(sin(deg2rad($obliq_corr)) * sin(deg2rad($sun_app_long))));
            $ha_sunrise = rad2deg(acos(cos(deg2rad(90.833)) / (cos(deg2rad($lat)) * cos(deg2rad($sun_decl))) - tan(deg2rad($lat)) * tan(deg2rad($sun_decl))));
            $daylength_min = 8 * $ha_sunrise;

            // Checks if it is 24-hour-long day or 0-hour-long day
            if (is_nan($daylength_min)) {
                $daylength_min = -1;
            }

            //array_push($dayLengths, [$i, $daylength_min]);
            array_push($dayLengths, [$i, $daylength_min]);
        }

        return $dayLengths;
    }
}

/*
 ** Copyright (C) 2021 KunoiSayami
 **
 ** This file is part of 1092-node-0528 under
 ** the AGPL v3 License: https://www.gnu.org/licenses/agpl-3.0.txt
 **
 ** This program is free software: you can redistribute it and/or modify
 ** it under the terms of the GNU Affero General Public License as published by
 ** the Free Software Foundation, either version 3 of the License, or
 ** any later version.
 **
 ** This program is distributed in the hope that it will be useful,
 ** but WITHOUT ANY WARRANTY; without even the implied warranty of
 ** MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
 ** GNU Affero General Public License for more details.
 **
 ** You should have received a copy of the GNU Affero General Public License
 ** along with this program. If not, see <https://www.gnu.org/licenses/>.
 */
'use strict';

function set_camera(enabled) {
    $.get('/camera_' + (enabled ? 'enable' : 'disable'))
        .done((res) => {
            if (res.status != 200) {
                alert('Set camera status error: ' + res.body);
                console.error(res);
            }
            refresh_status();
        });
}

function refresh_status() {
    $.get('/query_camera')
        .done((res) => {
            $('#camera_status').html(res.enabled ? 'Enabled' : 'Disabled');
            $('#set_online').css('display', res.enabled ? 'none' : 'unset');
            $('#set_offline').css('display', res.enabled ? 'unset' : 'none');
            //console.log(res);
        })
        .fail((_res) => {
            console.error('Fetch status failure');
        });
}

function parse_timestamp(timestamp) {
    return new Date(timestamp).toTimeString().split(' ')[0].substr(0, 5);
}

function parse_data(res, elem_func, label, color1, color2) {
    return {
        labels: res.map((element) => {
            return parse_timestamp(element.timestamp * 1000);
        }),
        datasets: [{
            label: label,
            data: res.map((element) => elem_func(element)),
            borderColor: color1,
            backgroundColor: color2,
        }]
    }
}

function parse_temperature_chart() {
    $.get('/query_temperature/day')
        .done((res) => {
            const data =
                parse_data(res, element => {
                    return {
                        x: parse_timestamp(element.timestamp * 1000),
                        y: parseFloat(element.temperature)
                    };
                }, 'Temperature', 'rgba(211,47,47,1)', 'rgba(211,47,47,0.5)');
            const ctx1 = document.getElementById('temperature_chart').getContext('2d');
            new Chart(ctx1, {
                type: 'line',
                data: data,
            });

            const data2 = parse_data(res, element => {
                return {
                    x: parse_timestamp(element.timestamp * 1000),
                    y: parseFloat(element.humidity)
                };
            }, 'Humidity', 'rgba(25,118,210,1)', 'rgba(25,118,210,0.5)')

            const ctx2 = document.getElementById('humidity_chart').getContext('2d');
            new Chart(ctx2, {
                type: 'line',
                data: data2,
            });
        });
}

document.addEventListener("DOMContentLoaded", function(_event) {
    refresh_status();
    parse_temperature_chart();
});

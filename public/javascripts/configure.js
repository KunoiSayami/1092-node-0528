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

document.addEventListener("DOMContentLoaded", function(_event) {
    refresh_status();
});

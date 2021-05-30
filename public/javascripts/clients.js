'use strict';
if (window.plugin === undefined) {
	window.plugin = function() {};
}
window.plugin.pi_stream = function() {};
window.plugin.pi_stream.websocket = null;
window.plugin.pi_stream.ws = function() {};

const default_location = localStorage.getItem('stream_server') || 'ws://127.0.0.1:8080/data';
const default_control_location = localStorage.getItem('control_server') || 'http://127.0.0.1:8081/';

let sendMessage = function (message) {
	if (window.plugin.pi_stream.websocket === null)
		return ;
	window.plugin.pi_stream.websocket.send(message);
}

let logger = function() {};

logger.debug = (text) => {
	console.debug(text);
}
logger.warning = (text) => {
	console.warn(text);
}
logger.error = (text) => {
	console.error(text);
}
logger.info = (text) => {
	console.info(text);
}

window.plugin.pi_stream.ws.onOpen = function (_evt) {
	logger.info('[WS] Connected');
	const image = document.getElementById('stream_pic');
	image.style.display = 'unset';
}

// TODO: use client base64 instead of server send base64
window.plugin.pi_stream.ws.onMessage = function (evt) {
	//logger.info('[WS] Got data');

	const image = document.getElementById('stream_pic');
	image.src = 'data:image/jpeg;base64,'+ evt.data;
}

window.plugin.pi_stream.ws.onError = function (evt) {
	logger.error('[WS] Error => ' + evt.data);
	alert('Websocket got error, please check console to get more information');
	try {
		window.plugin.pi_stream.ws.websocket.close();
	} catch (e) {}
	window.plugin.pi_stream.ws.websocket = null;
}

window.plugin.pi_stream.ws.onClose = function (_evt) {
	logger.info('[WS] Disconnected');
	window.plugin.pi_stream.ws.websocket = null;
}

function create_websocket_connect(url) {
	if (window.plugin.pi_stream.websocket !== null) {
		console.error('Please disconnect websocket first');
		return ;
	}
	window.plugin.pi_stream.websocket = new WebSocket(url);
	window.plugin.pi_stream.websocket.onopen = window.plugin.pi_stream.ws.onOpen;
	window.plugin.pi_stream.websocket.onclose = window.plugin.pi_stream.ws.onClose;
	window.plugin.pi_stream.websocket.onmessage = window.plugin.pi_stream.ws.onMessage;
	window.plugin.pi_stream.websocket.onerror = window.plugin.pi_stream.ws.onError;
}

function connect() {
	const url = document.getElementById('websocket_url').value;
	create_websocket_connect(url);
	document.getElementById('a_connect').style.display = 'none';
	document.getElementById('a_disconnect').style.display = 'unset';
	localStorage.setItem('stream_server', url);
}

function disconnect() {
	if (window.plugin.pi_stream.websocket === null) {
		console.error('Please connect websocket first');
		return ;
	}
	sendMessage('close');
	try {
		window.plugin.pi_stream.websocket.close();
	} catch (e) {
		console.error(e);

	}

	const image = document.getElementById('stream_pic');
	image.style.display = 'none';
	document.getElementById('a_connect').style.display = 'unset';
	document.getElementById('a_disconnect').style.display = 'none';
	window.plugin.pi_stream.websocket = null;
}

document.addEventListener("DOMContentLoaded", function(_event) {
	document.getElementById('websocket_url').value = default_location;
	document.getElementById('control_url').value = default_control_location;
});

function save_control_url(url) {
	localStorage.setItem('control_url', url);
}

function flash_led() {
	const url = document.getElementById('control_url').value;
	save_control_url(url);
	$.post(url + '/light')
	.done(() => {
		logger.debug('done');
	});
}
'use strict';
if (window.plugin === undefined) {
	window.plugin = function() {};
}
window.plugin.pi_stream = function() {};
window.plugin.pi_stream.websocket = null;
window.plugin.pi_stream.ws = function() {};

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

function connect(port) {
	//const url = document.getElementById('websocket_url').value;
	const url = (location.protocol !== 'https' ? 'w' : 'ws') + 's://' + location.hostname + ':' + port + '/data';
	create_websocket_connect(url);
	document.getElementById('a_connect').style.display = 'none';
	document.getElementById('a_disconnect').style.display = 'unset';
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

function flash_led() {
	$.post('/light')
	.done(() => {
		logger.debug('done');
	});
}

function breath_led() {
	$.post('/breath')
	.done(() => {
		logger.debug('done');
	});
}
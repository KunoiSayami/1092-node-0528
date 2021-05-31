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
import path from 'path';
import app from './app';
import httpProxy from 'http-proxy';

const config = require(path.resolve(process.cwd(), 'config.json'));
let server = app.listen((config.server || {}).port || process.env.SERVER_PORT || 8000);
let proxy = httpProxy.createProxy({target: (config.remote.camera).replace('http', 'ws')})
//let proxy = httpProxy.createProxyMiddleware();

app.get('/data', (req, res) => {
    console.log("proxying GET request", req.url);
    proxy.web(req, res, {});
});

server.on('upgrade', function (req, socket, head) {
    console.log("proxying upgrade request", req.url);
    console.log(req);
    proxy.ws(req, socket, head);
  });

function stop() {
    server.close();
    proxy.close();
}

export default stop;
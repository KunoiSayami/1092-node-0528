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
import express from 'express';
import path from 'path';
import superagent from 'superagent';
import fs from 'fs';

const router = express.Router();

const config = require(path.resolve(process.cwd(), 'config.json'));
const package_config = require(path.resolve(process.cwd(), 'package.json'));


// Process route GET home page
router.get('/', (req, res) => {
    res.render('index.html', {title: 'Index', repo_url: package_config.repository || '', author: package_config.author || ''});
});

// Process route GET /control
router.get('/control', (req, res) => {
    res.render('control.html', { title: 'control', port: (config.server || {}).stream_port || 8001});
    //res.render('index.html');
});

// Process route GET /config
router.get('/config', (req, res) => {
    res.render('config.html', { title: 'config' });
});

// Method for request GPIO api
async function request_api_basic(address: string, req, res) {
    try {
        const response = await superagent
            .post(config.remote.gpio + address)
            .send(JSON.stringify({times: req.body.times || 1}));
        res.status(response.status).send(response.body);
    } catch (e) {
        console.error(e);
        res.status(400).send(e);
        return;
    }
}

router.post('/light', async (req, res) => {
    await request_api_basic('light', req, res);
});

router.post('/breath', async (req, res) => {
    await request_api_basic('breath', req, res);
});

router.get('/query_camera', async (_req, res) => {
    const response = await superagent
        .get(config.remote.camera + 'query')
        .send();
    res.status(response.status).send(response.body);
});

router.get(/\/camera_(en|dis)able/, async (req, res) => {
    const response = await superagent
        .get(config.remote.camera + req.url.split('_')[1])
        .send();
    res.status(response.status).send(response.body);
});

router.get('/camera_take', async (_req, res) => {
    const response = await superagent
        .get(config.remote.camera + 'get_frame')
        .send();
    // https://stackabuse.com/encoding-and-decoding-base64-strings-in-node-js
    let buff = Buffer.from(response.body.frame, 'base64');
    res.status(response.status).contentType('jepg').send(buff);
});

// Process route POST /config/:num
router.post('/config/:num', (req, res) => {

});

export = router;

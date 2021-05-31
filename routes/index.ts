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

const router = express.Router();

const config = require(path.resolve(process.cwd(), 'config.json'));
const package_config = require(path.resolve(process.cwd(), 'package.json'));


// Process route GET home page
router.get('/', (req, res) => {
    res.render('index.html', {title: 'Index', repo_url: package_config.repository || '', author: package_config.author || ''});
});

// Process route GET /clients
router.get('/clients', (req, res) => {
    res.render('clients.html', { title: 'clients', port: (config.server || {}).stream_port || 8001});
    //res.render('index.html');
});

// Process route GET /sqrt
router.get('/sqrt', (req, res) => {
    res.render('sqrt.html', { title: 'sqrt' });
});

router.post('/light', async (_req, res) => {
    const response = await superagent
        .post(config.remote.gpio + 'light')
        .send();
    res.status(response.status).send(response.body);
});

router.post('/breath', async (_req, res) => {
    const response = await superagent
        .post(config.remote.gpio + 'breath')
        .send();
    res.status(response.status).send(response.body);
});

// Process route POST /sqrt/:num
router.post('/sqrt/:num', (req, res) => {

    let num = Number(req.params.num);

    let status = 200;
    let result = "";

    // Check number integrity
    if (Number.isNaN(num)) {
        status = 400;
        result = "Please input a vaild number";
    }
    else {
        try {
            result = String(Math.sqrt(num));
        } catch (e) {
            status = 400;
            result = e.toString();
        }
    }

    let response = {status: status, result: result};

    //console.debug(response);

    res.status(status).send(response);
});

export = router;

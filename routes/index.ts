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
import mongodb from 'mongodb';
import moment from 'moment';
import nodemailer from 'nodemailer';

const router = express.Router();

const config = require(path.resolve(process.cwd(), 'config.json'));
const package_config = require(path.resolve(process.cwd(), 'package.json'));
const db_uri =
  "mongodb://localhost/temperatureRecords";


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

interface TemperatureRecord {
    readonly temperature: string;
    readonly humidity: string;
    readonly timestamp: Date;
}

function get_middle_number(arr: Array<number>) {
    let len = arr.length;
    if (!len) {
        return new Error('Array should not empty!');
    }
    if (len == 1) {
        return arr[0];
    }
    let midn = Math.trunc(len / 2);
    let a = arr.sort();
    if (len & 1) {
        return a[ midn - 1];
    }
    return ((a[midn] + a[midn - 1]) / 2).toFixed(2);
}

router.get('/query_temperature/:period?', async (req, res) => {
    let period = req.params['period'];
    let limit = 1;
    const num_period = parseInt(period);
    let query_day = false;
    if (!isNaN(num_period)) {
        limit = num_period;
    } else if (period === 'day') {
        query_day = true;
    } else if (period !== undefined) {
        res.status(400).send(JSON.stringify({status: 400, reason: 'Illegal argument'}));
        return;
    }
    const client = new mongodb.MongoClient(db_uri, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    try {
        await client.connect();
        const database = client.db('temperatureRecords');
        const records = database.collection('records');
        let arrays = Array();
        if (!query_day) {
            arrays = await records.find().sort({_id: -1}).limit(limit).toArray();
            res.contentType('json').status(200).write(JSON.stringify(arrays.map((element: TemperatureRecord) => {
                return {temperature: element.temperature, humidity: element.humidity, timestamp: element.timestamp.getTime()}
            })));
        } else {
            const day = moment().subtract(1, 'days').toDate();
            const filter = {timestamp: {$gte: day}};
            const result = await records.find(filter).toArray();
            let current_minute = new Date(0);
            let c_temp = Array(), c_hum = Array();
            result.forEach((element: TemperatureRecord) => {
                // TODO: should use more accurate compare
                if (element.timestamp.getMinutes() !== current_minute.getMinutes()) {
                    current_minute = element.timestamp;
                    current_minute.setSeconds(0);
                    current_minute.setMilliseconds(0);
                    if (c_temp.length && c_hum.length) {
                        arrays.push({temperature: get_middle_number(c_temp), humidity: get_middle_number(c_hum), timestamp: current_minute.getTime() / 1000});
                    }
                    c_temp = Array(), c_hum = Array();
                }
                c_temp.push(parseFloat(element.temperature));
                c_hum.push(parseFloat(element.humidity));
            });
            res.contentType('json').status(200).write(JSON.stringify(arrays));
        }
        //console.log(arrays);
        res.end();
    }
    finally {
        client.close();
    }
    res.send();
});

let last_send = 0;

function parse_email(email: string) {
    return email.split('@')[0] + ' <' + email + '>';
}

function create_transporter_object() {
    let basic = {
        service: "gmail",
        auth: {
            user: config.smtp.user,
            pass: config.smtp.password
        },
        logger: true,
        debug: false, // include SMTP traffic in the logs
        proxy: undefined,
    };

    if ((config.smtp.proxy || '').length) {
        basic.proxy = config.smtp.proxy;
    } else {
        delete basic.proxy;
    }
    
    let transporter = nodemailer.createTransport(
        basic,
        {
            // default message fields

            // sender info
            from: parse_email(config.smtp.user),
        }
    );
    return transporter;
}

// Process route POST /send_mail
router.post('/send_mail', async (req, res) => {
    if (req.body.email === undefined) {
        res.sendStatus(400);
        return;
    }

    let transporter = create_transporter_object();

    const result = await superagent
        .get(config.remote.camera + 'get_frame')
        .send();
    let image = result.body.frame;

    let message = {
        to: parse_email(req.body.email),
        subject: 'Got frame ' + Date.now(),
        html: `<p><b>Hello</b> frame: <img src="frame@current"/></p>
        <p>` + new Date().toString()+ `</p>`,
        attachments: [
            {
                filename: 'image.png',
                content: Buffer.from(image,'base64'),
                cid: 'frame@current' // should be as unique as possible
            }
        ]
    }

    transporter.sendMail(message, (error, info) => {
        if (error) {
            console.log('Error occurred');
            console.log(error.message);
            res.sendStatus(500);
            return ;
        }
        console.log('Message sent successfully!');
        console.log(nodemailer.getTestMessageUrl(info));

        // only needed when using pooled connections
        transporter.close();
        res.status(204);
    });
    
    res.end();
});

export = router;

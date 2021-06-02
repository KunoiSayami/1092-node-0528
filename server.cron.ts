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

import superagent from 'superagent';
import path from 'path';
import mongodb from 'mongodb';

const config = require(path.resolve(process.cwd(), 'config.json'));

const uri =
  "mongodb://localhost/temperatureRecords";

interface TemperatureResult {
    readonly status: number;
    readonly temperature: number;
    readonly humidity: number;
}

function result2record(input: TemperatureResult) {
    return {
        temperature: input.temperature.toFixed(2),
        humidity: input.humidity.toFixed(2),
        timestamp: new Date()
    };
}

async function query_temperature() {
    const response = await superagent
        .get(config.remote.gpio + 'temperature')
        .send();
    if (response.status == 200) {
        await write_database(response.body);
    } else {
        console.error(response.status, response.body);
    }
}

async function write_database(input: TemperatureResult) {
    let record = result2record(input);
    const client = new mongodb.MongoClient(uri, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    try {
        await client.connect();
        const database = client.db('temperatureRecords');
        const records = database.collection('records');

        await records.insertOne(record);
    }
    finally {
        await client.close();
    }
}

const cronObj = setInterval(async () => {
    await query_temperature();
}, 10000);

export = cronObj;
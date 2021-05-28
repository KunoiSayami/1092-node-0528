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
process.env.LOGGER_DISABLED = 'true';
import stop from './server';
import {describe, expect, test} from '@jest/globals'
import app from './app';
import supertest from 'supertest';

let requester = supertest(app);

describe('Test server', () => {

    test('Test get home page', async () => {
        let response = await requester.get('/');
        
        expect(response.status).toStrictEqual(200);
    });

    test('Test sqrt function', async () => {
        let response = await requester.post('/sqrt/9').send();
        expect(response.status).toStrictEqual(200);
        expect(response.body).toBeInstanceOf(Object);
        expect(response.body).toHaveProperty('status');
        expect(response.body.status).toStrictEqual(200);
        expect(response.body).toHaveProperty('result');
        expect(response.body.result).toStrictEqual('3');
    });


    test('Test sqrt NaN function', async () => {
        let response = await requester.post('/sqrt/Number').send();
        expect(response.status).toStrictEqual(400);
        expect(response.body).toBeInstanceOf(Object);
        expect(response.body).toHaveProperty('status');
        expect(response.body.status).toStrictEqual(400);
    });

    test('Test clients list request', async () => {
        let response = await requester.post('/clients').send();
        expect(response.status).toStrictEqual(200);
        expect(response.body).toBeInstanceOf(Object);
        expect(response.body).toHaveProperty('status');
        expect(response.body.status).toStrictEqual(200);
        expect(response.body).toHaveProperty('result');
        expect(Array.isArray(response.body.result)).toStrictEqual(true);
    });

    afterAll(() => {
        stop();
    })

});
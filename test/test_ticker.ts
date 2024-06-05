'use strict';

import * as path from 'path';
import * as fs from 'fs';
import { expect } from 'chai';
//@ts-ignore
import { KiteTicker } from '../lib/ticker';


// Ticker binary packets
const ltpPacket = 'ltpMode_binary.packet';
const quotePacket = 'quoteMode_binary.packet';
const fullPacket  = 'fullMode_binary.packet';

function testTicker() {
    //@ts-ignore
    const ticker = new KiteTicker({
        api_key: 'api_key',
        access_token: 'access_token',
    });

    // Fetch ltp mode tick data
    describe('ltpModeTick', function() {
        it('Fetch ltp mode tick data', () => {
            const tickData = ticker.parseBinary(toArrayBuffer(ltpPacket));
            expect(tickData).to.be.an('array');
            expect(tickData[0].mode).to.equal('ltp');
            expect(tickData).to.have.nested.property('[0].instrument_token');
            expect(tickData).to.have.nested.property('[0].last_price');
        })
    });
    
    // Fetch quote mode tick data
    describe('quoteModeTick', function() {
        it('Fetch quote mode tick data', () => {
            const tickData = ticker.parseBinary(toArrayBuffer(quotePacket));
            expect(tickData).to.be.an('array');
            expect(tickData[0].mode).to.equal('quote');
            expect(tickData).to.have.nested.property('[0].instrument_token');
            expect(tickData).to.have.nested.property('[0].ohlc');
            expect(tickData).to.have.nested.property('[0].volume_traded');
            
        })
    });

    // Fetch Full mode tick data
    describe('fullModeTick', function() {
        it('Fetch full mode tick data', () => {
            const tickData = ticker.parseBinary(toArrayBuffer(fullPacket));
            expect(tickData).to.be.an('array');
            expect(tickData[0].mode).to.equal('full');
            expect(tickData).to.have.nested.property('[0].exchange_timestamp');
            expect(tickData).to.have.nested.property('[0].last_trade_time');
            expect(tickData).to.have.nested.property('[0].depth');
            
        })
    });
}

// Read binary packets
function readBufferPacket(fileName: string) {
    const rawData = fs.readFileSync(path.join(__dirname, './', fileName));
    return rawData;
}

// Convert buffer to binary buffer array
function toArrayBuffer(tickerMode: string) {
    const buf = readBufferPacket(tickerMode);
    const ab = new ArrayBuffer(buf.length);
    const view = new Uint8Array(ab);
    for (let i = 0; i < buf.length; ++i) {
        view[i] = buf[i];
    }
    return ab;
}

// Run ticker tests
testTicker()
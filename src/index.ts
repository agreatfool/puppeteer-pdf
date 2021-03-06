#!/usr/bin/env node

import * as puppeteer from 'puppeteer';
import * as program from 'commander';
import * as validator from 'validator';

import * as LibPath from 'path';
import * as LibFs from 'mz/fs';
import {Stats} from "fs";

const pkg = require('../package.json');

const TYPES = ['PDF', 'PNG'];
const BASE_NAME = 'output';

program.version(pkg.version)
    .description('agreatfool-pdf: convert html url to pdf')
    .option('-u, --url <string>', 'source url')
    .option('-o, --output_dir <dir>', 'output directory')
    .option('-N, --output_name <string>', `output basename, optional, default is ${BASE_NAME}`)
    .option('-p, --proxy <string>', `proxy url, example: proxy.example.com:8010`)
    .option(`-t, --type <${TYPES.join('|')}>, default is ${TYPES[0]}`)
    .parse(process.argv);

const ARGS_SOURCE_URL = (program as any).url === undefined ? undefined : (program as any).url;
const ARGS_OUTPUT_DIR = (program as any).output_dir === undefined ? undefined : (program as any).output_dir;
const ARGS_OUTPUT_NAME = !(program as any).output_name ? BASE_NAME : (program as any).output_name;
const ARGS_PROXY_URL = (program as any).proxy === undefined ? undefined : (program as any).proxy;
const ARGS_TYPE = !(program as any).type === undefined ? TYPES[0] : (program as any).type;

class PuppeteerPdf {

    public async run() {
        console.log('agreatfool-pdf starting ...');

        await this._validate();
        await this._process();
    }

    private async _validate() {
        console.log('agreatfool-pdf validating ...');

        // -u url
        if (ARGS_SOURCE_URL === undefined) {
            console.log('Source url required, please provide -u option');
            process.exit(1);
        }
        if (!validator.isURL(ARGS_SOURCE_URL)) {
            console.log('Valid url required, please check -u option');
            process.exit(1);
        }

        // -o output_dir
        if (ARGS_OUTPUT_DIR === undefined) {
            console.log('Output directory required, please provide -o option');
            process.exit(1);
        }
        let destStat: Stats = LibFs.statSync(ARGS_OUTPUT_DIR);
        if (!destStat.isDirectory()) {
            console.log('Valid output directory required, please check -o option');
            process.exit(1);
        }

        // -t type
        if (TYPES.indexOf(ARGS_TYPE) === -1) {
            console.log('Valid type required, please check -t option');
            process.exit(1);
        }
    }

    private async _process() {
        console.log(`agreatfool-pdf processing url: ${ARGS_SOURCE_URL} ...`);

        const options = ARGS_PROXY_URL === undefined ? {} : {
            ignoreHTTPSErrors: true,
            args: [
                `--proxy-server=${ARGS_PROXY_URL}`,
                "--no-sandbox",
                "--disable-setuid-sandbox"
            ]
        };

        const browser = await puppeteer.launch(options);
        const page = await browser.newPage();
        await page.goto(ARGS_SOURCE_URL);
        await page.emulateMedia('screen');

        if (ARGS_TYPE === TYPES[0]) {
            await page.pdf({path: LibPath.join(ARGS_OUTPUT_DIR, ARGS_OUTPUT_NAME) + '.pdf'});
        } else {
            await page.screenshot({path: LibPath.join(ARGS_OUTPUT_DIR, ARGS_OUTPUT_NAME) + '.png'});
        }

        await browser.close();
    }

}

new PuppeteerPdf().run().then(_ => _).catch(_ => console.log(_));

process.on('uncaughtException', (error) => {
    console.error(`Process on uncaughtException error = ${error.stack}`);
});

process.on('unhandledRejection', (error) => {
    console.error(`Process on unhandledRejection error = ${error.stack}`);
});
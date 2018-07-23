#!/usr/bin/env node
"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const puppeteer = require("puppeteer");
const program = require("commander");
const validator = require("validator");
const LibPath = require("path");
const LibFs = require("mz/fs");
const pkg = require('../package.json');
const BASE_NAME = 'output.pdf';
program.version(pkg.version)
    .description('puppeteer-pdf: convert html url to pdf')
    .option('-u, --url <string>', 'source url')
    .option('-o, --output_dir <dir>', 'output directory')
    .option('-N, --output_name <string>', `output basename, optional, default is ${BASE_NAME}`)
    .option('-p, --proxy <string>', `proxy url, example: proxy.example.com:8010`)
    .parse(process.argv);
const ARGS_SOURCE_URL = program.url === undefined ? undefined : program.url;
const ARGS_OUTPUT_DIR = program.output_dir === undefined ? undefined : program.output_dir;
const ARGS_OUTPUT_NAME = !program.output_name ? BASE_NAME : program.output_name;
const ARGS_PROXY_URL = program.proxy === undefined ? undefined : program.proxy;
class PuppeteerPdf {
    run() {
        return __awaiter(this, void 0, void 0, function* () {
            console.log('puppeteer-pdf starting ...');
            yield this._validate();
            yield this._process();
        });
    }
    _validate() {
        return __awaiter(this, void 0, void 0, function* () {
            console.log('puppeteer-pdf validating ...');
            if (ARGS_SOURCE_URL === undefined) {
                console.log('Source url required, please provide -u option');
                process.exit(1);
            }
            if (!validator.isURL(ARGS_SOURCE_URL)) {
                console.log('Valid url required, please check -u option');
                process.exit(1);
            }
            if (ARGS_OUTPUT_DIR === undefined) {
                console.log('Output directory required, please provide -o option');
                process.exit(1);
            }
            let destStat = LibFs.statSync(ARGS_OUTPUT_DIR);
            if (!destStat.isDirectory()) {
                console.log('Valid output directory required, please check -o option');
                process.exit(1);
            }
        });
    }
    _process() {
        return __awaiter(this, void 0, void 0, function* () {
            console.log(`puppeteer-pdf processing url: ${ARGS_SOURCE_URL} ...`);
            const options = ARGS_PROXY_URL === undefined ? {} : {
                ignoreHTTPSErrors: true,
                args: [
                    `--proxy-server=${ARGS_PROXY_URL}`,
                    "--no-sandbox",
                    "--disable-setuid-sandbox"
                ]
            };
            const browser = yield puppeteer.launch(options);
            const page = yield browser.newPage();
            yield page.goto(ARGS_SOURCE_URL);
            yield page.emulateMedia('screen');
            yield page.pdf({ path: LibPath.join(ARGS_OUTPUT_DIR, ARGS_OUTPUT_NAME) });
            yield browser.close();
        });
    }
}
new PuppeteerPdf().run().then(_ => _).catch(_ => console.log(_));
process.on('uncaughtException', (error) => {
    console.error(`Process on uncaughtException error = ${error.stack}`);
});
process.on('unhandledRejection', (error) => {
    console.error(`Process on unhandledRejection error = ${error.stack}`);
});
//# sourceMappingURL=index.js.map
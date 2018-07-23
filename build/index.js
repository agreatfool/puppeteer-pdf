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
const ARGS_SOURCE_URL = program.url === undefined ? undefined : program.url;
const ARGS_OUTPUT_DIR = program.output_dir === undefined ? undefined : program.output_dir;
const ARGS_OUTPUT_NAME = !program.output_name ? BASE_NAME : program.output_name;
const ARGS_PROXY_URL = program.proxy === undefined ? undefined : program.proxy;
const ARGS_TYPE = !program.type === undefined ? TYPES[0] : program.type;
class PuppeteerPdf {
    run() {
        return __awaiter(this, void 0, void 0, function* () {
            console.log('agreatfool-pdf starting ...');
            yield this._validate();
            yield this._process();
        });
    }
    _validate() {
        return __awaiter(this, void 0, void 0, function* () {
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
            let destStat = LibFs.statSync(ARGS_OUTPUT_DIR);
            if (!destStat.isDirectory()) {
                console.log('Valid output directory required, please check -o option');
                process.exit(1);
            }
            // -t type
            if (TYPES.indexOf(ARGS_TYPE) === -1) {
                console.log('Valid type required, please check -t option');
                process.exit(1);
            }
        });
    }
    _process() {
        return __awaiter(this, void 0, void 0, function* () {
            console.log(`agreatfool-pdf processing url: ${ARGS_SOURCE_URL} ...`);
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
            if (ARGS_TYPE === TYPES[0]) {
                yield page.pdf({ path: LibPath.join(ARGS_OUTPUT_DIR, ARGS_OUTPUT_NAME) + '.pdf' });
            }
            else {
                yield page.screenshot({ path: LibPath.join(ARGS_OUTPUT_DIR, ARGS_OUTPUT_NAME) + '.png' });
            }
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
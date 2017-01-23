/*
 * Copyright (c) 2017 Michael Krotscheck
 *
 * Licensed under the Apache License, Version 2.0 (the "License"); you may not
 * use this file except in compliance with the License. You may obtain a copy
 * of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS, WITHOUT
 * WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import {exec} from "child_process";

const grid = require("selenium-grid-status"); // tslint:disable-line
const dockerFile = `${__dirname}/selenium-grid.docker.yml`;

export class SeleniumGrid {

    private config: {} = {
        host: "localhost",
        port: 4444,
    };

    /**
     * Start a new selenium cluster using docker.
     *
     * @return {Promise}
     */
    public start(): Promise<any> {
        return new Promise((resolve, reject) => {
            exec(`docker-compose -f ${dockerFile} up -d`, (err, stdout, stderr) => {
                process.stdout.write(stdout);
                process.stderr.write(stderr);
                if (err) {
                    reject(err);
                } else {
                    resolve();
                }
            });
        }).then(() => this.pauseForStartup());
    }

    /**
     * Stop an existing selenium cluster.
     *
     * @return {Promise}
     */
    public stop(): Promise<any> {
        return new Promise((resolve, reject) => {
            exec(`docker-compose -f ${dockerFile} down`, (err, stdout, stderr) => {
                process.stdout.write(stdout);
                process.stderr.write(stderr);
                if (err) {
                    reject(err);
                } else {
                    resolve();
                }
            });
        });
    }

    /**
     * Detect to see if there's a selenium cluster running on port 4444.
     *
     * @return {Promise} A promise that resolves if a cluster is found.
     */
    public detectSelenium(): Promise<number> {
        return new Promise((resolve, reject) => {
            grid.available(this.config, (err: Error, nodes: ISeleniumNode[]) => {
                if (err || !nodes) {
                    reject(err);
                    return;
                }

                // Do a quick count.
                let browsers: ISeleniumBrowser[] = [];
                nodes.forEach((node) => browsers = browsers.concat(node.browser));
                browsers = browsers
                    .filter((browser) => browser.seleniumProtocol === "WebDriver");
                resolve(browsers.length);
            });
        });
    }

    /**
     * Wait for the selenium cluster to come online.
     *
     * @return {Promise<void>}
     */
    private pauseForStartup(): Promise<any> {
        return this.detectSelenium()
            .catch(() => this.pauseForStartup());
    }
}

/**
 * Quick interface describing the output from selenium-grid-status.
 */
interface ISeleniumNode {
    browser: ISeleniumBrowser[];
    configs: Array<{}>;
}

/**
 * A browser descriptor from selenium-grid-status.
 */
interface ISeleniumBrowser {
    seleniumProtocol: string;
    browserName: string;
    maxInstances: string;
    platform: string;
}

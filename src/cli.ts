#!/usr/bin/env node
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
 *
 */

import {stderr, stdout} from "process";
import * as yargs from "yargs";
import {SeleniumGrid} from "./selenium";

const grid = new SeleniumGrid();

/**
 * This commandline script permits starting a selenium grid on the local
 * docker host.
 */
yargs // tslint:disable-line
    .command({
        command: "start",
        describe: "Start a selenium grid on the docker host.",
        handler: () => {
            return grid.detectSelenium()
                .then((count) => stdout.write(`Selenium already running with ${count} browsers.\n`))
                .catch(() => {
                    return grid.start()
                        .then(() => stdout.write("Selenium started.\n"))
                        .catch((err) => stderr.write(err));
                });
        },
    })
    .command({
        command: "stop",
        describe: "Stop the selenium grid (if it exists) on the docker host.",
        handler: () => {
            stdout.write("Stopping Selenium.\n");
            return grid.stop()
                .then(() => stdout.write("Selenium stopped.\n"))
                .catch((err) => stderr.write(err));
        },
    })
    .command({
        command: "restart",
        describe: "Restart the selenium grid on the docker host.",
        handler: () => {
            stdout.write("Stopping Selenium.\n");
            return grid.stop()
                .then(() => stdout.write("Selenium stopped.\nRestarting Selenium.\n"))
                .then(() => grid.start())
                .then(() => stdout.write("Selenium restarted sucessfully.\n"))
                .catch((err) => stderr.write(err));
        },
    })
    .command({
        command: "status",
        describe: "Check the current status of the selenium hosts.",
        handler: () => {
            return grid.detectSelenium()
                .then((count) => stdout.write(`Selenium is running with ${count} browsers.\n`))
                .then(() => process.exit(0))
                .catch(() => stdout.write("Selenium is not running.\n"))
                .then(() => process.exit(1));
        },
    })
    .demandCommand(1, 1)
    .help()
    .argv;

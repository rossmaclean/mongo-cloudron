#!/usr/bin/env node

/* jshint esversion: 8 */
/* global describe */
/* global before */
/* global after */
/* global it */
/* global xit */

'use strict';

require('chromedriver');

var execSync = require('child_process').execSync,
    expect = require('expect.js'),
    path = require('path'),
    { Builder, By, Key, until } = require('selenium-webdriver'),
    { Options } = require('selenium-webdriver/chrome');

describe('Application life cycle test', function () {
    this.timeout(0);

    const LOCATION = 'test';
    const TEST_TIMEOUT = 10000;
    const EXEC_ARGS = { cwd: path.resolve(__dirname, '..'), stdio: 'inherit' };
    const username = process.env.USERNAME;
    const password = process.env.PASSWORD;

    let browser, app;

    before(function (done) {
        if (!process.env.PASSWORD) return done(new Error('PASSWORD env var not set'));
        if (!process.env.USERNAME) return done(new Error('USERNAME env var not set'));

        browser = new Builder().forBrowser('chrome').setChromeOptions(new Options().windowSize({ width: 1280, height: 1024 })).build();
        done();
    });

    after(function () {
        browser.quit();
    });

    async function waitForElement(elem) {
        await browser.wait(until.elementLocated(elem), TEST_TIMEOUT);
        await browser.wait(until.elementIsVisible(browser.findElement(elem)), TEST_TIMEOUT);
    }


    function getAppInfo() {
        var inspect = JSON.parse(execSync('cloudron inspect'));
        app = inspect.apps.filter(function (a) { return a.location.indexOf(LOCATION) === 0; })[0];
        expect(app).to.be.an('object');
    }

    async function mongoAndNodeStart() {
        await browser.get(`https://${app.fqdn}/`);
        await waitForElement(By.xpath(`//pre[contains(text(), "OK")]`));
    }

    it('build app', function () { execSync('cloudron build', EXEC_ARGS); });
    it('install app', function () { execSync('cloudron install --location ' + LOCATION, EXEC_ARGS); });

    it('can get app information', getAppInfo);

    it('mongodb and node start', mongoAndNodeStart);

    it('can restart app', function () { execSync(`cloudron restart --app ${app.id}`, EXEC_ARGS); });

    it('backup app', function () { execSync('cloudron backup create --app ' + app.id, EXEC_ARGS); });
    it('restore app', function () {
        const backups = JSON.parse(execSync(`cloudron backup list --raw --app ${app.id}`));
        execSync('cloudron uninstall --app ' + app.id, EXEC_ARGS);
        execSync('cloudron install --location ' + LOCATION, EXEC_ARGS);
        getAppInfo();
        execSync(`cloudron restore --backup ${backups[0].id} --app ${app.id}`, EXEC_ARGS);
    });

    it('move to different location', function () {
        browser.manage().deleteAllCookies();
        execSync('cloudron configure --location ' + LOCATION + '2', EXEC_ARGS);
    });

    it('can get app information', getAppInfo);

    it('uninstall app', function () { execSync('cloudron uninstall --app ' + app.id, EXEC_ARGS); });

    // test update
    // Below disabled until app is on app store
    xit('can install app', function () { execSync('cloudron install --appstore-id com.mongodb.cloudronapp --location ' + LOCATION, EXEC_ARGS); });
    it('can get app information', getAppInfo);

    it('can update', function () { execSync(`cloudron update --app ${LOCATION} --no-wait`, EXEC_ARGS); });
    // it('can enable API Port', function () { execSync(`cloudron configure --app ${LOCATION} -p API_PORT=27018 -l ${LOCATION} `, EXEC_ARGS); });
    it('can get app information', getAppInfo);

    it('uninstall app', function () { execSync('cloudron uninstall --app ' + app.id, EXEC_ARGS); });
});


/*
Copyright 2016 Google Inc. All Rights Reserved.
Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at
    http://www.apache.org/licenses/LICENSE-2.0
Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
*/
const Handlebars = require('handlebars');
Handlebars.registerHelper('read_partial', (api, browser) => {
  try {
    return fs.readFileSync(`partials/${api}_${browser}.html`, 'utf-8');
  } catch (e) {
    console.log(`${api}_${browser}: ${e}`);
    return '';
  }
});

const htmlmin = require('htmlmin');
const htmlminOpts = {
  cssmin: true,
  jsmin: true,
  removeComments: true
};

const fs = require('fs');
const data = require('./data.json');
data.last_update = new Date().toString();
data.engines = {};
data.browser.sort((a, b) => a.renderingEngine === b.renderingEngine ? (a.name > b.name ? 1 : -1) : (a.renderingEngine > b.renderingEngine ? 1 : -1));
data.browser.forEach(browser => data.engines[browser.renderingEngine] = (data.engines[browser.renderingEngine] || 0) + 1)
data.api.sort((a, b) => a.name === b.name ? 0 : (a.name < b.name ? -1 : 1))
data.api.forEach(api =>
  data.browser.forEach(browser =>
    data.status[api.tag][browser.tag] = data.status[api.tag][browser.tag] || {completeness: "no signal"}
  )
);
const rawTpl = fs.readFileSync('index.hbs', 'utf-8');
Handlebars.registerHelper("counter", function (index){
  return index + 1;
});
const tpl = Handlebars.compile(rawTpl);
fs.writeFileSync('index.html', htmlmin(tpl(data), htmlminOpts), 'utf-8');

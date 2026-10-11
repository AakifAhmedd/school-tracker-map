const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const path = require('node:path');
const root = path.join(__dirname, '..');
const html = fs.readFileSync(path.join(root, 'index.html'), 'utf8');
const script = html.match(/<script>\s*([\s\S]*?)<\/script>/)[1];
// Compile the complete app, then isolate pure data helpers without browser stubs.
new vm.Script(script);
const helpers = script.slice(script.indexOf('      function coordinate'), script.indexOf('      function fitSchools')) +
  script.slice(script.indexOf('      function schoolsFromCsvText'), script.indexOf('      /* ---------- Initial load')) +
  script.slice(script.indexOf('      function parseCSV'), script.indexOf('      /* ---------- Device saves'));
const context = vm.createContext({URL});
vm.runInContext(`const STAGES = {not_started:{},training:{},screening:{},completed:{}}; let schools = []; ${helpers}`, context);
const csv = fs.readFileSync(path.join(root, 'schools.csv'), 'utf8');
context.input = csv;
vm.runInContext('schools = schoolsFromCsvText(input)', context);
assert.equal(vm.runInContext('schools.length', context), 205);
assert.equal(vm.runInContext('schools.filter(hasCoordinates).length', context), 87);
assert.equal(vm.runInContext('schools.filter(s => s.stage === "completed").length', context), 41);
// Every researched coordinate must have matching, dated source evidence.
context.evidence = fs.readFileSync(path.join(root, 'coordinate-sources.csv'), 'utf8');
const evidence = JSON.parse(vm.runInContext('JSON.stringify(parseCSV(evidence))', context));
assert.equal(evidence.length, 24); // Header + 23 researched schools.
assert.equal(new Set(evidence.slice(1).map(row => row[0])).size, 23);
const schoolData = JSON.parse(vm.runInContext('JSON.stringify(schools)', context));
for (const [name, lat, lng, source, corroboration, notes, checked] of evidence.slice(1)) {
  const school = schoolData.find(s => s.name === name);
  assert.ok(school, `Missing researched school: ${name}`);
  assert.equal(school.lat, Number(lat));
  assert.equal(school.lng, Number(lng));
  assert.ok(school.lat >= 5.8 && school.lat <= 9.9 && school.lng >= 79.5 && school.lng <= 82);
  assert.ok(source.startsWith('https://') && notes.length > 0 && checked === '2026-10-10');
}
const exported = vm.runInContext('exportCsv()', context);
context.input = exported;
assert.equal(vm.runInContext('schoolsFromCsvText(input).length', context), 205);
assert.equal(vm.runInContext('schoolsFromCsvText(input).filter(hasCoordinates).length', context), 87);
assert.equal(vm.runInContext('schoolsFromCsvText(input).every((s,i) => s.name === schools[i].name && s.notes === schools[i].notes && s.stage === schools[i].stage)', context), true);
context.input = '\uFEFFname,lat,lng,stage,notes\r\n"School ""A"", East",,,completed,"First line\nSecond ""quoted"" line"\r\n';
vm.runInContext('schools = schoolsFromCsvText(input)', context);
assert.equal(vm.runInContext('schools[0].name', context), 'School "A", East');
assert.equal(vm.runInContext('schools[0].notes', context), 'First line\nSecond "quoted" line');
context.input = vm.runInContext('exportCsv()', context);
assert.equal(vm.runInContext('schoolsFromCsvText(input)[0].notes === schools[0].notes', context), true);
assert.equal(vm.runInContext('hasCoordinates({lat:coordinate(""),lng:80})', context), false);
assert.equal(vm.runInContext('hasCoordinates({lat:coordinate("7junk"),lng:80})', context), false);
assert.equal(vm.runInContext('hasCoordinates({lat:91,lng:80})', context), false);
context.input = 'name,lat,lng,stage\nTest,7,80,constructor';
assert.equal(vm.runInContext('schoolsFromCsvText(input)[0].stage', context), 'not_started');
context.input = 'name,notes\nTest,Missing headers';
assert.throws(() => vm.runInContext('schoolsFromCsvText(input)', context), /CSV needs/);
context.input = '"Unclosed';
assert.throws(() => vm.runInContext('parseCSV(input)', context), /unclosed/);
// Coordinate input accepts public Maps formats, prioritises place pins, and rejects unsafe links.
for (const [input, lat, lng, source] of [
  [' 7.87, 80.77 ', 7.87, 80.77, 'coordinates'],
  ['https://www.google.com/maps/search/?api=1&query=7.87%2C80.77', 7.87, 80.77, 'pin'],
  ['https://maps.google.com/?q=-33.86,151.2', -33.86, 151.2, 'pin'],
  ['https://www.google.lk/maps/place/Test/@8,81,15z/data=!3d7.87!4d80.77', 7.87, 80.77, 'pin'],
  ['https://www.google.com/maps/@7.87,80.77,15z', 7.87, 80.77, 'map view'],
  ['https://www.google.com/maps?ll=7.87,80.77', 7.87, 80.77, 'map view'],
]) {
  context.input = input;
  assert.deepEqual(JSON.parse(vm.runInContext('JSON.stringify(locationFromText(input))', context)), {lat, lng, source});
}
for (const input of ['91,80', '7,181', 'not coordinates', 'https://evil.example/maps?q=7,80',
  'javascript:alert(1)', 'https://google.com.evil.example/maps?q=7,80', 'https://user:pass@www.google.com/maps?q=7,80',
  'https://maps.app.goo.gl/test', 'https://www.google.com/maps?q=School', 'https://www.google.com/maps?q=%E0%A4%A']) {
  context.input = input;
  assert.equal(vm.runInContext('locationFromText(input)', context), null);
}
// Basemap styling suppresses both known POIs and future layers, retaining useful roads.
vm.runInContext(script.slice(script.indexOf('      function plainMapStyles'), script.indexOf('      let pickingLocation')), context);
for (const layer of ['poi', 'landcover', 'landuse', 'park', 'transportation_name', 'place', 'future_extra_layer']) {
  assert.equal(vm.runInContext(`plainMapStyles()["${layer}"].length`, context), 0);
}
assert.ok(vm.runInContext('plainMapStyles().transportation({class:"primary"}, 14).weight > 0', context));
assert.ok(vm.runInContext('plainMapStyles().building({}, 15).fill', context));
require('./location-flow.cjs');
require('./device-saves.cjs');
const version = fs.readFileSync(path.join(root, 'VERSION'), 'utf8').trim();
assert.match(html, new RegExp(`application-version" content="${version.replaceAll('.', '\\.')}`));
assert.ok(html.includes(`rotary-wheel.svg?v=${version}`));
console.log('Passed: CSV coverage, export round-trip, quoted/multiline fields, coordinate validation, malformed input, app syntax and version.');

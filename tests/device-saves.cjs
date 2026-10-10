const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const path = require('node:path');
const html = fs.readFileSync(path.join(__dirname, '..', 'index.html'), 'utf8');
const script = html.match(/<script>\s*([\s\S]*?)<\/script>/)[1];
const helpers = script.slice(script.indexOf('      function coordinate'), script.indexOf('      function fitSchools')) +
  script.slice(script.indexOf('      function schoolsFromCsvText'), script.indexOf('      /* ---------- Initial load')) +
  script.slice(script.indexOf('      function parseCSV'), script.indexOf('      /* ---------- Device saves'));
const saves = script.slice(script.indexOf('      /* ---------- Device saves'), script.indexOf('      /* ---------- Toast'));
const els = new Map();
const element = id => {
  if (!els.has(id)) els.set(id, {hidden: false, textContent: '', addEventListener() {}});
  return els.get(id);
};
const storage = new Map();
let blocked = false;
const context = vm.createContext({URL, window: {confirm: () => false},
  document: {getElementById: element},
  localStorage: {
    getItem(key) { if (blocked) throw Error('Storage blocked'); return storage.get(key) || null; },
    setItem(key, value) { if (blocked) throw Error('Storage blocked'); storage.set(key, value); },
  },
});
vm.runInContext(`const STAGES = {not_started:{},training:{},screening:{},completed:{}}; let schools = []; ${helpers} ${saves}`, context);
const run = text => vm.runInContext(text, context);
context.base = 'name,lat,lng,stage,notes\nExisting,,,completed,Keep notes';
run('schools = schoolsFromCsvText(base); restoreSavedSchools(base); schools[0].lat = 7; schools[0].lng = 80;');
assert.equal(run('persistSchoolChanges()'), true);
const originalSave = storage.values().next().value;
run('schools = schoolsFromCsvText(base); restoreSavedSchools(base)');
assert.equal(run('schools[0].lat'), 7);
assert.equal(run('schools[0].notes'), 'Keep notes');
assert.match(element('deviceStatus').textContent, /saved changes/);
// A published change takes precedence. Keep the device copy available for separate download.
context.updated = 'name,lat,lng,stage,notes\nExisting,8,81,completed,Published update';
run('schools = schoolsFromCsvText(updated); restoreSavedSchools(updated)');
assert.equal(run('schools[0].lat'), 8);
assert.equal(run('schools[0].notes'), 'Published update');
assert.equal(element('recoveryExport').hidden, false);
assert.equal(run('recoveryCsv.includes("Keep notes")'), true);
assert.equal(run('persistSchoolChanges()'), false);
assert.equal(storage.values().next().value, originalSave); // Never overwrite an unreviewed earlier copy.
run('recoveryCsv = null');
blocked = true;
assert.equal(run('persistSchoolChanges()'), false);
assert.match(element('deviceStatus').textContent, /before closing/);
blocked = false;
storage.set(run('SAVE_KEY'), '{malformed');
assert.doesNotThrow(() => run('restoreSavedSchools(base)'));
assert.match(element('deviceStatus').textContent, /could not be read/);
assert.doesNotThrow(() => element('resetDevice').onclick());
assert.equal(storage.values().next().value, '{malformed'); // Cancellation leaves stored work alone.
console.log('Passed: device-save restoration, published-update recovery, storage errors, and malformed saves.');

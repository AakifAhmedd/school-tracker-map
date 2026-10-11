const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const html = fs.readFileSync(require('node:path').join(__dirname, '..', 'index.html'), 'utf8');
const script = html.match(/<script>\s*([\s\S]*?)<\/script>/)[1];
// Run the real location/form handlers with a minimal DOM and controllable GPS callbacks.
const elements = new Map();
function element(id) {
  if (!elements.has(id)) elements.set(id, {
    value: '', hidden: false, textContent: '', disabled: false, tabIndex: 0,
    dataset: {}, attrs: {}, listeners: {},
    classList: {add() {}, remove() {}},
    setAttribute(k, v) { this.attrs[k] = v; },
    addEventListener(k, fn) { this.listeners[k] = fn; },
    closest() { return element('details'); }, scrollIntoView() { this.scrolled = true; }, focus() { this.focused = true; },
    reset() {
      for (const key of ['name', 'lat', 'lng', 'location', 'notes']) element('f_' + key).value = '';
      element('f_stage').value = 'screening';
    },
  });
  return elements.get(id);
}
const gps = [];
const mapEvents = {};
const context = vm.createContext({
  URL,
  document: {getElementById: element, querySelector: element},
  window: {isSecureContext: true, matchMedia: () => ({matches: false, addEventListener() {}})},
  navigator: {geolocation: {getCurrentPosition(success, failure, options) { gps.push({success, failure, options}); }}},
  requestAnimationFrame: fn => fn(),
  map: {on: (name, fn) => mapEvents[name] = fn, invalidateSize() {}, setView() {}},
  reducedMotion: true,
  rebuildMap() {}, rebuildList() {}, showToast() {}, persistSchoolChanges() { return true; },
});
const helpers = script.slice(script.indexOf('      function coordinate'), script.indexOf('      function fitSchools'));
const controls = script.slice(script.indexOf('      let pickingLocation'), script.indexOf('      // One decoded'));
const handlers = script.slice(script.indexOf('      /* ---------- Location input'), script.indexOf('      /* ---------- Shared:'));
vm.runInContext(`let schools = []; ${helpers} ${controls} ${handlers}`, context);
const run = text => vm.runInContext(text, context);
run('schools = [{name:"Existing school",lat:NaN,lng:NaN,stage:"completed",notes:"Keep notes"}]; openSchoolForm(schools[0])');
assert.equal(element('.app').dataset.view, 'inputs');
assert.equal(element('f_name').value, 'Existing school');
assert.equal(element('f_stage').value, 'completed');
assert.equal(element('f_notes').value, 'Keep notes');
element('f_location').value = 'https://www.google.com/maps?q=7.87,80.77';
element('useLink').onclick();
assert.equal(element('f_lat').value, '7.870000');
assert.equal(element('f_lng').value, '80.770000');
assert.equal(run('schools[0].lat'), NaN); // No change until saved.
element('addForm').listeners.submit({preventDefault() {}, target: element('addForm')});
assert.equal(run('schools.length'), 1); // Edit does not duplicate the school.
assert.equal(run('schools[0].lat'), 7.87);
assert.equal(run('schools[0].stage'), 'completed');
assert.equal(run('schools[0].notes'), 'Keep notes');
assert.equal(element('.app').dataset.view, 'map');
assert.equal(element('mapTab').attrs['aria-selected'], 'true');
run('openSchoolForm()');
element('f_name').value = 'New school';
element('locateBtn').onclick();
assert.equal(element('locateBtn').disabled, true);
assert.equal(gps[0].options.enableHighAccuracy, true);
gps[0].success({coords: {latitude: 8.1, longitude: 80.2, accuracy: 12}});
assert.equal(element('f_lat').value, '8.100000');
assert.match(element('locationStatus').textContent, /12 m/);
assert.equal(element('locateBtn').disabled, false);
assert.equal(element('locationReady').hidden, false);
assert.equal(element('locationHeading').textContent, '✓ Location selected');
element('addForm').listeners.submit({preventDefault() {}, target: element('addForm')});
assert.equal(run('schools.length'), 2);
for (const [code, message] of [[1, /denied/], [2, /unavailable/], [3, /timed out/]]) {
  element('locateBtn').onclick(); gps.at(-1).failure({code});
  assert.match(element('locationStatus').textContent, message);
  assert.equal(element('locateBtn').disabled, false);
}
element('locateBtn').onclick();
const stale = gps.at(-1);
run('openSchoolForm(schools[0])');
stale.success({coords: {latitude: 9, longitude: 81, accuracy: 5}});
assert.equal(element('f_lat').value, 7.87); // A late GPS response cannot overwrite another school.
element('locateBtn').onclick();
const manualStale = gps.at(-1);
element('f_lat').value = '7.1'; element('f_lat').listeners.input();
manualStale.success({coords: {latitude: 9, longitude: 81, accuracy: 5}});
assert.equal(element('f_lat').value, '7.1');
element('pickBtn').onclick();
assert.equal(element('.app').dataset.view, 'map');
assert.equal(element('pickHint').hidden, false);
mapEvents.click({latlng: {lat: 7.3, lng: 80.3}});
assert.equal(element('.app').dataset.view, 'inputs');
assert.equal(element('f_lat').value, '7.300000');
assert.equal(element('pickHint').hidden, true);
element('f_location').value = 'https://maps.app.goo.gl/test';
element('useLink').onclick();
assert.equal(element('openMaps').hidden, false);
assert.match(element('locationStatus').textContent, /full browser URL/);
assert.equal(element('f_lat').value, '7.300000');
context.window.isSecureContext = false;
element('locateBtn').onclick();
assert.match(element('locationStatus').textContent, /HTTPS/);
// Mobile capture preserves existing metadata and starts new schools at Not Started.
run('phoneLayout.matches = true; openSchoolForm(schools[0])');
assert.equal(element('sidebar').dataset.editor, 'open');
assert.equal(element('f_name').readOnly, true);
assert.equal(element('manualCoords').open, false);
element('f_name').value = 'Unintended rename';
element('f_stage').value = 'training';
element('f_notes').value = 'Unintended notes change';
run('fillLocation(7.2,80.2,"Ready")');
element('addForm').listeners.submit({preventDefault() {}, target: element('addForm')});
assert.equal(run('schools[0].name'), 'Existing school');
assert.equal(run('schools[0].stage'), 'completed');
assert.equal(run('schools[0].notes'), 'Keep notes');
assert.equal(element('sidebar').dataset.editor, 'closed');
assert.equal(element('.app').dataset.view, 'inputs');
element('newSchoolBtn').onclick();
assert.equal(element('f_name').readOnly, false);
assert.equal(element('f_stage').value, 'not_started');
element('f_name').value = 'Phone school';
run('fillLocation(7.4,80.4,"Ready")');
element('addForm').listeners.submit({preventDefault() {}, target: element('addForm')});
assert.equal(run('schools[2].stage'), 'not_started');
assert.equal(element('locationReady').hidden, true);
element('newSchoolBtn').onclick();
element('backToSchools').onclick();
assert.equal(element('sidebar').dataset.editor, 'closed');
console.log('Passed: Maps links, edit without duplicates, local save, tabs, map picking, GPS success/errors and stale-response protection.');

// Validation stays next to the missing field, and phone selection is brought into view.
run('openSchoolForm()');
element('addForm').listeners.submit({preventDefault() {}});
assert.equal(element('nameError').hidden, false);
assert.equal(element('f_name').attrs['aria-invalid'], 'true');
assert.equal(element('f_name').focused, true);
element('f_name').value = 'Capture school'; element('f_name').listeners.input();
assert.equal(element('nameError').hidden, true);
element('addForm').listeners.submit({preventDefault() {}});
assert.equal(element('locationStatus').focused, true);
element('pickBtn').onclick();
mapEvents.click({latlng: {lat: 6.78, lng: 79.88}});
assert.equal(element('locationReady').hidden, false);
assert.equal(element('locationReady').focused, true);
assert.equal(element('locationReady').scrolled, true);
assert.equal(element('locationHeading').textContent, '✓ Location selected');
assert.equal(run('schools.some(s => s.name === "Capture school")'), false);
console.log('Passed: inline required-field errors and immediate phone selection feedback without saving.');

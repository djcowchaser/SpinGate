const DEFAULT_SETTINGS = {
  gamemodes: [
    'Big Head Snipers', 'Domination', 'FFA OITC', 'Gun Game',
    'King of the Hill', 'Team Deathmatch', 'Swat', 'Takedown',
  ],
  mapLists: {
    'Arena maps': [
      'Abyss', 'Academy', 'Bypass', 'Containment', 'Core', 'Eden',
      'Foregone Destruction', 'Frontier', 'Grit', 'Hammerhead',
      'Karman Station', 'Oasis', 'Ozone', 'Runway', 'Stadium V2',
      'Terra 13', 'Trihard', 'Zenith',
    ],
    'Simulation maps': [
      'Simulation Anomaly', 'Simulation Charlie', 'Simulation Divide',
      'Simulation Faceoff', 'Simulation Hectic', 'Simulation Moshpit',
    ],
    'ICESmoke maps': [
      'Forest of Fades', 'Halls of Torment', 'Arena of the dammed',
      'Planetary Fortress', 'Template of Abaddon',
    ],
  },
  assignments: {
    'Big Head Snipers': ['Arena maps', 'ICESmoke maps'], Domination: ['Arena maps'],
    'FFA OITC': ['Arena maps', 'ICESmoke maps'], 'Gun Game': ['Arena maps', 'ICESmoke maps'],
    'King of the Hill': ['Arena maps'], 'Team Deathmatch': ['Arena maps'],
    Swat: ['Arena maps'], Takedown: ['Simulation maps'],
  },
};

const STORAGE_KEY = 'spingate-settings-v2';
const gamemodeOutput = document.querySelector('#gamemode');
const mapOutput = document.querySelector('#map');
const statusOutput = document.querySelector('#status');
const gamemodesInput = document.querySelector('#gamemodes');
const mapListNameInput = document.querySelector('#map-list-name');
const mapListMapsInput = document.querySelector('#map-list-maps');
const assignmentGamemode = document.querySelector('#assignment-gamemode');
const assignmentMapList = document.querySelector('#assignment-map-list');
const mapListSummary = document.querySelector('#map-list-summary');
const assignmentSummary = document.querySelector('#assignment-summary');

let settings = loadSettings();
let gamemodeHistory = [];
let mapTurn = 0;
let mapLastSeenTurn = {};

function cloneDefaults() {
  return structuredClone(DEFAULT_SETTINGS);
}

function textToList(value) {
  return [...new Set(value.split('\n').map((item) => item.trim()).filter(Boolean))];
}

function isValidSettings(value) {
  return value
    && Array.isArray(value.gamemodes) && value.gamemodes.length > 0
    && value.mapLists && typeof value.mapLists === 'object'
    && Object.entries(value.mapLists).every(([name, maps]) => name.trim() && Array.isArray(maps) && maps.length > 0)
    && value.assignments && typeof value.assignments === 'object';
}

function normalizeAssignments(value) {
  return Object.fromEntries(Object.entries(value.assignments ?? {}).map(([mode, mapLists]) => [
    mode,
    (Array.isArray(mapLists) ? mapLists : [mapLists])
      .filter((name) => typeof name === 'string' && Array.isArray(value.mapLists[name])),
  ]));
}

function addIceSmokeDefaults(value) {
  const mapListName = 'ICESmoke maps';
  if (!value.mapLists[mapListName]) value.mapLists[mapListName] = cloneDefaults().mapLists[mapListName];
  for (const mode of ['Big Head Snipers', 'Gun Game', 'FFA OITC']) {
    if (value.gamemodes.includes(mode)) {
      value.assignments[mode] = [...new Set([...(value.assignments[mode] ?? []), mapListName])];
    }
  }
  return value;
}

function migrateOldSettings(value) {
  if (!value?.arenaGamemodes || !value?.arenaMaps || !value?.simulationMaps) return null;
  const gamemodes = [...value.arenaGamemodes, value.takedownGamemode];
  return {
    gamemodes,
    mapLists: { 'Arena maps': value.arenaMaps, 'Simulation maps': value.simulationMaps },
    assignments: Object.fromEntries(gamemodes.map((mode) => [
      mode, [mode === value.takedownGamemode ? 'Simulation maps' : 'Arena maps'],
    ])),
  };
}

function loadSettings() {
  try {
    const current = JSON.parse(localStorage.getItem(STORAGE_KEY));
    if (isValidSettings(current)) {
      current.assignments = normalizeAssignments(current);
      return addIceSmokeDefaults(current);
    }
    const oldSettings = migrateOldSettings(JSON.parse(localStorage.getItem('spingate-settings')));
    if (isValidSettings(oldSettings)) return addIceSmokeDefaults(oldSettings);
  } catch {
    // Defaults below keep a malformed browser value from breaking the page.
  }
  return cloneDefaults();
}

function saveSettings(message) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
  resetHistories();
  renderSettings();
  statusOutput.textContent = `${message} Rotation history reset.`;
}

function resetHistories() {
  gamemodeHistory = [];
  mapTurn = 0;
  mapLastSeenTurn = {};
}

function historyLimit(pool) {
  return Math.ceil((pool.length - 1) / 2);
}

function drawWithoutRecentRepeat(pool, history) {
  const eligible = pool.filter((item) => !history.includes(item));
  const selection = eligible[Math.floor(Math.random() * eligible.length)];
  return {
    selection,
    nextHistory: [...history, selection].slice(-historyLimit(pool)),
  };
}

function drawMapWithGlobalCooldown(pool) {
  mapTurn += 1;
  const cooldown = historyLimit(pool);
  const eligible = pool.filter((map) => mapTurn - (mapLastSeenTurn[map] ?? -Infinity) > cooldown);
  const selection = eligible[Math.floor(Math.random() * eligible.length)];
  mapLastSeenTurn[selection] = mapTurn;
  return selection;
}

function configuredGamemodes() {
  return settings.gamemodes.filter((mode) => {
    return settings.assignments[mode]?.some((name) => settings.mapLists[name]?.length);
  });
}

function mapsForGamemode(mode) {
  return [...new Set(settings.assignments[mode].flatMap((name) => settings.mapLists[name] ?? []))];
}

function spin() {
  const gamemodes = configuredGamemodes();
  if (!gamemodes.length) {
    statusOutput.textContent = 'Add at least one gamemode-to-map-list link before spinning.';
    return;
  }

  const gamemodeResult = drawWithoutRecentRepeat(gamemodes, gamemodeHistory);
  const gamemode = gamemodeResult.selection;
  const mapListNames = settings.assignments[gamemode];
  const maps = mapsForGamemode(gamemode);
  const map = drawMapWithGlobalCooldown(maps);

  gamemodeHistory = gamemodeResult.nextHistory;
  gamemodeOutput.textContent = gamemode;
  mapOutput.textContent = map;
  statusOutput.textContent = `Using ${mapListNames.join(' + ')}. Spin again for another matchup.`;
}

function addOptions(select, options) {
  select.replaceChildren(...options.map((value) => {
    const option = document.createElement('option');
    option.value = value;
    option.textContent = value;
    return option;
  }));
}

function renderMapLists() {
  mapListSummary.replaceChildren(...Object.entries(settings.mapLists).map(([name, maps]) => {
    const item = document.createElement('li');
    const label = document.createElement('span');
    label.textContent = `${name} (${maps.length} maps)`;
    const edit = document.createElement('button');
    edit.type = 'button';
    edit.textContent = 'Edit';
    edit.addEventListener('click', () => {
      mapListNameInput.value = name;
      mapListMapsInput.value = maps.join('\n');
      mapListNameInput.focus();
    });
    item.append(label, edit);
    return item;
  }));
}

function renderAssignments() {
  assignmentSummary.replaceChildren(...settings.gamemodes.map((mode) => {
    const item = document.createElement('li');
    const label = document.createElement('span');
    label.textContent = `${mode} → ${settings.assignments[mode]?.join(', ') || 'No map lists assigned'}`;
    item.append(label);
    return item;
  }));
}

function renderSettings() {
  gamemodesInput.value = settings.gamemodes.join('\n');
  const mapListNames = Object.keys(settings.mapLists);
  addOptions(assignmentGamemode, settings.gamemodes);
  addOptions(assignmentMapList, mapListNames);
  renderMapLists();
  renderAssignments();
}

document.querySelector('#save-gamemodes').addEventListener('click', () => {
  const gamemodes = textToList(gamemodesInput.value);
  if (!gamemodes.length) {
    statusOutput.textContent = 'Add at least one gamemode.';
    return;
  }
  settings.gamemodes = gamemodes;
  settings.assignments = Object.fromEntries(gamemodes.map((mode) => [mode, settings.assignments[mode] ?? []]));
  saveSettings('Gamemodes saved.');
});

document.querySelector('#save-map-list').addEventListener('click', () => {
  const name = mapListNameInput.value.trim();
  const maps = textToList(mapListMapsInput.value);
  if (!name || !maps.length) {
    statusOutput.textContent = 'A map list needs a name and at least one map.';
    return;
  }
  settings.mapLists[name] = maps;
  saveSettings(`Map list “${name}” saved.`);
});

document.querySelector('#clear-map-list').addEventListener('click', () => {
  mapListNameInput.value = '';
  mapListMapsInput.value = '';
  mapListNameInput.focus();
});

document.querySelector('#save-assignment').addEventListener('click', () => {
  const mode = assignmentGamemode.value;
  const mapList = assignmentMapList.value;
  if (!mode || !mapList) {
    statusOutput.textContent = 'Create a gamemode and a map list before linking them.';
    return;
  }
  settings.assignments[mode] = [...new Set([...(settings.assignments[mode] ?? []), mapList])];
  saveSettings(`${mapList} linked to ${mode}.`);
});

document.querySelector('#restore-defaults').addEventListener('click', () => {
  settings = cloneDefaults();
  localStorage.removeItem(STORAGE_KEY);
  resetHistories();
  renderSettings();
  statusOutput.textContent = 'Default settings restored. Rotation history reset.';
});

renderSettings();
document.querySelector('#spin').addEventListener('click', spin);

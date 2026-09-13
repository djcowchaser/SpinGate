const DEFAULT_SETTINGS = {
  arenaGamemodes: [
    'Big Head Snipers', 'Domination', 'FFA OITC', 'Gun Game',
    'King of the Hill', 'Team Deathmatch', 'Swat',
  ],
  takedownGamemode: 'Takedown',
  arenaMaps: [
    'Abyss', 'Academy', 'Bypass', 'Containment', 'Core', 'Eden',
    'Foregone Destruction', 'Frontier', 'Grit', 'Hammerhead',
    'Karman Station', 'Oasis', 'Ozone', 'Runway', 'Stadium V2',
    'Terra 13', 'Trihard', 'Zenith',
  ],
  simulationMaps: [
    'Simulation Anomaly', 'Simulation Charlie', 'Simulation Divide',
    'Simulation Faceoff', 'Simulation Hectic', 'Simulation Moshpit',
  ],
};

const STORAGE_KEY = 'spingate-settings';
const form = document.querySelector('#settings-form');
const spinButton = document.querySelector('#spin');
const gamemodeOutput = document.querySelector('#gamemode');
const mapOutput = document.querySelector('#map');
const statusOutput = document.querySelector('#status');

let settings = loadSettings();
let gamemodeHistory = [];
let arenaMapHistory = [];
let simulationMapHistory = [];

function cloneDefaults() {
  return structuredClone(DEFAULT_SETTINGS);
}

function loadSettings() {
  try {
    const stored = JSON.parse(localStorage.getItem(STORAGE_KEY));
    return isValidSettings(stored) ? stored : cloneDefaults();
  } catch {
    return cloneDefaults();
  }
}

function isValidSettings(value) {
  return value
    && Array.isArray(value.arenaGamemodes) && value.arenaGamemodes.length > 0
    && typeof value.takedownGamemode === 'string' && value.takedownGamemode.trim()
    && Array.isArray(value.arenaMaps) && value.arenaMaps.length > 0
    && Array.isArray(value.simulationMaps) && value.simulationMaps.length > 0;
}

function allGamemodes() {
  return [...settings.arenaGamemodes, settings.takedownGamemode];
}

// Keep enough recent choices that at least 50% of the other choices must occur first.
function historyLimit(pool) {
  return Math.ceil((pool.length - 1) / 2);
}

function drawWithoutRecentRepeat(pool, history) {
  const eligible = pool.filter((item) => !history.includes(item));
  const selection = eligible[Math.floor(Math.random() * eligible.length)];
  const nextHistory = [...history, selection].slice(-historyLimit(pool));
  return { selection, nextHistory };
}

function spin() {
  const gamemodeResult = drawWithoutRecentRepeat(allGamemodes(), gamemodeHistory);
  const isTakedown = gamemodeResult.selection === settings.takedownGamemode;
  const maps = isTakedown ? settings.simulationMaps : settings.arenaMaps;
  const history = isTakedown ? simulationMapHistory : arenaMapHistory;
  const mapResult = drawWithoutRecentRepeat(maps, history);

  gamemodeHistory = gamemodeResult.nextHistory;
  if (isTakedown) simulationMapHistory = mapResult.nextHistory;
  else arenaMapHistory = mapResult.nextHistory;

  gamemodeOutput.textContent = gamemodeResult.selection;
  mapOutput.textContent = mapResult.selection;
  statusOutput.textContent = 'Spin again for another matchup.';
}

function textToList(value) {
  return [...new Set(value.split('\n').map((item) => item.trim()).filter(Boolean))];
}

function populateForm() {
  form.elements['arena-gamemodes'].value = settings.arenaGamemodes.join('\n');
  form.elements['takedown-gamemode'].value = settings.takedownGamemode;
  form.elements['arena-maps'].value = settings.arenaMaps.join('\n');
  form.elements['simulation-maps'].value = settings.simulationMaps.join('\n');
}

function resetHistories() {
  gamemodeHistory = [];
  arenaMapHistory = [];
  simulationMapHistory = [];
}

form.addEventListener('submit', (event) => {
  event.preventDefault();
  const nextSettings = {
    arenaGamemodes: textToList(form.elements['arena-gamemodes'].value),
    takedownGamemode: form.elements['takedown-gamemode'].value.trim(),
    arenaMaps: textToList(form.elements['arena-maps'].value),
    simulationMaps: textToList(form.elements['simulation-maps'].value),
  };

  if (!isValidSettings(nextSettings)) {
    statusOutput.textContent = 'Each list needs at least one entry.';
    return;
  }

  settings = nextSettings;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
  resetHistories();
  statusOutput.textContent = 'Settings saved. The rotation history has been reset.';
});

document.querySelector('#restore-defaults').addEventListener('click', () => {
  settings = cloneDefaults();
  localStorage.removeItem(STORAGE_KEY);
  resetHistories();
  populateForm();
  statusOutput.textContent = 'Default settings restored. The rotation history has been reset.';
});

populateForm();
spinButton.addEventListener('click', spin);

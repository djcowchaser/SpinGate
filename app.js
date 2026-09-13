import readline from 'node:readline/promises';
import { stdin as input, stdout as output } from 'node:process'; 

const ARENA_MAPS = [
	'Abyss',
	'Academy',
	'Bypass',
	'Containment',
	'Core',
	'Eden',
	'Foregone Destruction',
	'Frontier',
	'Grit',
	'Hammerhead',
	'Karman Station',
	'Oasis',
	'Ozone',
	'Runway',
	'Stadium V2',
	'Terra 13',
	'Trihard',
	'Zenith',
];

const SIMULATION_MAPS = [
	'Simulation Anomaly',
	'Simulation Charie',
	'Simulation Divide',
	'Simulation Faceoff',
	'Simulation Hectic',
	'Simulation Moshpit',
];

const ARENA_ROYALE_MAPS = [
	'Drought',
	'Fracture',
	'Glacier',
	'Inferno',
	'Outskirts',
	'Sanctum',
];

const QUICK_PLAY_MAPS = [
	...ARENA_MAPS,
	...SIMULATION_MAPS,
];

const ARENA_ROYAL_GAMEMODE = 'Arena Royale';

const ARENA_GAMEMODES = [
	'Big Head Snipers',
	'Domination',
	'FFA OITC',
	'Gun Game',
	'King of the Hill',
	'Team Deathmatch',
	'Swat',
];

const TAKEDOWN_GAMEMODE = 'Takedown';

const PARTY_GAMEMODES = [
	'FFA Fiesta',
	'Firecracker',
	'Splitball',
	'Speed Bats',
	'Shotty Snipers',
	'Teabag Confirmed',
];

const OTHER_GAMEMODES = [
	'Hotzone',
	'Shotty Snipers',
];

const QUICK_PLAY_GAMEMODES = [
	...ARENA_GAMEMODES,
	TAKEDOWN_GAMEMODE,
]

async function main() {
	console.log('--- Starting ---\n');

	console.log('Gamemodes and maps will appear. Press "0" any time to stop the program.\n')

	const rl = readline.createInterface({ input, output });
	let gamemodes = [...QUICK_PLAY_GAMEMODES];
	let arenaMaps = [...ARENA_MAPS];
	let simulationMaps = [...SIMULATION_MAPS];

	let shouldContinue = true;
	while (shouldContinue) {
		const {gamemode, map} = getNextGamemodeAndMap({gamemodes, arenaMaps, simulationMaps});
		const response = await rl.question(`Gamemode: ${gamemode}\nMap: ${map}\n`);
		if (response === '0') {
			shouldContinue = false;
		}

		gamemodes = gamemodes.length === 1 ? gamemodes = [...QUICK_PLAY_GAMEMODES] : gamemodes.filter(curr => curr !== gamemode);
		if (gamemode === TAKEDOWN_GAMEMODE) {
			simulationMaps = simulationMaps.length === 1 ? simulationMaps = [...SIMULATION_MAPS] :simulationMaps.filter(curr => curr !== map);
		} else {
			arenaMaps = arenaMaps.length === 1 ? arenaMaps = [...ARENA_MAPS] : arenaMaps.filter(curr => curr !== map);
		}
	}

	rl.close();

	console.log('\n--- Done ---');
}

function getNextGamemodeAndMap({gamemodes, arenaMaps, simulationMaps}) {
	const gamemode = gamemodes[Math.floor(Math.random() * gamemodes.length)];

	let map;
	if (gamemode === TAKEDOWN_GAMEMODE) {
		map = simulationMaps[Math.floor(Math.random() * simulationMaps.length)];
	} else {
		map = arenaMaps[Math.floor(Math.random() * arenaMaps.length)];
	}

	return {
		gamemode,
		map,
	}
}

main();

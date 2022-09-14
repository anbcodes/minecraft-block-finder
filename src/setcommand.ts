import RegionFile from "./region.js";

const regions = process.argv[2];

const x = +process.argv[3];
const y = +process.argv[4];
const z = +process.argv[5];

if (typeof x !== 'number' || typeof y !== 'number' || typeof z !== 'number') {
    console.log("Usage: setcommand <regions> <x> <y> <z> <cmd>");
    process.exit(1);
}

const command = process.argv.slice(6).join(' ');

console.log('Regions:', regions);
console.log('x, y, z:', x, y, z);
console.log('Command:', command);

async function run() {
    const chunkX = Math.floor(x / 16);
    const chunkZ = Math.floor(z / 16);
    const regionX = Math.floor(chunkX / 32);
    const regionZ = Math.floor(chunkZ / 32);

    const filename = `r.${regionX}.${regionZ}.mca`;

    const file = new RegionFile(filename);

    await file.initialize();

    const chunk = file.read(chunkX % 32, chunkZ % 32);
}

run();

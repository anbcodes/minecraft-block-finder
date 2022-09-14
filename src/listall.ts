import fs from 'fs/promises';

const filename = process.argv[2];

const filterType = process.argv[3] || 'R';

const filterCommand = new RegExp(process.argv.slice(4).join(' '));

async function run() {
    const data = JSON.parse((await fs.readFile(filename)).toString())

    let filter = (_: any) => true;

    if (filterType === 'R') {
        filter = (e: any) => (e.item.auto.value || e.item.powered.value) && e.Command.match(filterCommand);
    } else if (filterType === 'N') {
        filter = (e: any) => e.Command.match(filterCommand);
    } else if (filterType === 'O') {
        filter = (e: any) => !(e.item.auto.value || e.item.powered.value) && e.Command.match(filterCommand);
    }

    Object.values(data).flat().filter(filter).forEach((cmdBlock: any) => {
        console.log(`${cmdBlock.x} ${cmdBlock.y} ${cmdBlock.z}: ${cmdBlock.Command}`);
    })
}

run();

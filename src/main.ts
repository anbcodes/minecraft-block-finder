import fs from 'fs/promises';

import RegionFile from './region.js';

async function run() {

    let cache: { [name: string]: number } = {}
    try {
        cache = JSON.parse((await fs.readFile('./cache.json')).toString())
    } catch (e) {
        console.log('No cache found')
    }


    let found: { [name: string]: any[] } = {};

    try {
        found = JSON.parse((await fs.readFile('./found.json')).toString());
    } catch (_) {
        console.log('No previous commands found');
    }

    const root = '/home/andrew/MCServers/creative/world/region/';

    const files = await fs.readdir(root);

    let finished = 0;
    let total = files.length;

    await Promise.all(files.map(async (filename: string) => {
        const stat = await fs.stat(root + filename);

        if (stat.mtimeMs <= cache[root + filename]) {
            finished += 1;
            return;
        } else {
            cache[root + filename] = stat.mtimeMs;
        }

        const regionFile = new RegionFile(root + filename);

        await regionFile.initialize();

        const foundForRegion: any[] = [];

        for (let x = 0; x < 32; x++) {
            for (let z = 0; z < 32; z++) {
                const chunk = await regionFile.read(x, z);

                if (chunk?.value.block_entities?.type === 'list') {
                    const block_entities = chunk.value.block_entities.value;
                    if (block_entities.type === 'compound') {
                        const list = block_entities.value;
                        Promise.all(list.map(async (item: any) => {
                            if (item.Command) {
                                foundForRegion.push({
                                    x: item.x.value,
                                    y: item.y.value,
                                    z: item.z.value,
                                    Command: item.Command.value,
                                    item,
                                });

                                console.log(`Found! ${item.x.value}, ${item.y.value}, ${item.z.value}: ${item.Command.value}`);
                            }
                        }))
                    }
                }
            }
        }

        found[root + filename] = foundForRegion;

        await regionFile.close();
        finished += 1;
        console.log(`${Math.round(finished / total * 100 * 100) / 100}% done -`, 'finished', filename);
    }))

    console.log('================ Found these ====================');
    Object.values(found).flat().forEach((cmdBlock: any) => {
        console.log(`${cmdBlock.x} ${cmdBlock.y} ${cmdBlock.z}: ${cmdBlock.Command}`);
    })

    fs.writeFile('found.json', JSON.stringify(found));

    fs.writeFile('cache.json', JSON.stringify(cache));



    // const world = new Anvil('/home/andrew/MCServers/creative/world/region');

    // const chunk = await world.load(0, 0);

    // if (!chunk) return;

    // for (let x = 0; x < 16; x++) {
    //     console.log('x', x);
    //     for (let y = -64; y < 319; x++) {
    //         for (let z = 0; z < 16; x++) {
    //             const block = chunk.getBlock(new Vec3(x, y, z));
    //             if (block.name === 'repeating_command_block') {
    //                 // @ts-ignore
    //                 console.log(`Found! ${x}, ${y}, ${z}: ${block?.entity?.Command.value}`)
    //             }
    //         }
    //     }
    // }

}

run();
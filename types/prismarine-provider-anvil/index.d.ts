import { NBT } from 'prismarine-nbt';
import { Buffer } from 'node';

import { PCChunk, BedrockChunk } from 'prismarine-chunk';

type PrismarineChunk = PCChunk | BedrockChunk;

declare class AnvilClass {
    private regions: { [filename: string]: RegionFile /*A RegionFile*/ }
    public path: string;

    constructor(path: string);

    public regionFileName(x: number, z: number): string;

    getRegion(x: number, z: number): Promise<RegionFile> /* RegionFile */

    // returns a Promise. Resolve a Chunk object or reject if it hasn’t been generated
    load(x: number, z: number): Promise<PrismarineChunk | null>;

    loadRaw(x: number, z: number): Promise<NBT>;

    // returns a Promise. Resolve an empty object when successful
    save(x: number, z: number, chunk: PrismarineChunk): Promise<void>;

    saveRaw(x: number, z: number, nbt: NBT): Promise<void>;

    getAllChunksInRegion(x: number, z: number): Promise<PrismarineChunk[]>;

    close(): Promise<void[]>;
}

declare function Anvil(version: string): typeof AnvilClass;

declare class RegionFile {
    private sizeDelta: number;
    public fileName: string;
    public lastModified: number;
    public q: Promise<void>;

    constructor(path: string);

    initialize(): Promise<void>;

    private _initialize(): Promise<void>;

    /* gets how much the region file has grown since it was last checked */
    getSizeDelta(): number

    /*
     * gets an (uncompressed) stream representing the chunk data returns null if
     * the chunk is not found or an error occurs
     */
    read(x: number, z: number): Promise<NBT>;

    write(x: number, z: number, nbtData: NBT): Promise<void>;

    /* write a chunk at (x,z) with length bytes of data to disk */
    _write(x: number, z: number, nbtData: NBT): Promise<void>;

    writeChunk(sectorNumber: number, data: Buffer, length: number): Promise<void>;

    /* is this an invalid chunk coordinate? */
    static outOfBounds(x: number, z: number): boolean;

    getOffset(x: number, z: number): number;

    hasChunk(x: number, z: number): boolean;

    setOffset(x: number, z: number, offset: number): Promise<void>;

    setTimestamp(x: number, z: number, value: number): Promise<void>;

    close(): Promise<void>

    VERSION_GZIP: 1;
    VERSION_DEFLATE: 2;
    SECTOR_BYTES: 4096;
    SECTOR_INTS: 1024;
    CHUNK_HEADER_SIZE: 5;
}
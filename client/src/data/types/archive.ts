//
// Archive data types for the archive system.
//

export interface ArchiveEntry {
    id: string;
    groupId: string;
    name: string;
    shortName: string;
    description: string;
    shortDescription: string;
    image: string;
};

export interface ArchiveGroupEntry {
    id: string;
    name: string;
    archives: ArchiveEntry[];
};
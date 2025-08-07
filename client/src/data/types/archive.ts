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
    rating?: string;
    image: string;
    heavy?: boolean;
};

export interface ArchiveGroupEntry {
    id: string;
    name: string;
    archives: ArchiveEntry[];
};
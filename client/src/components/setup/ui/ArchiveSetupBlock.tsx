import { PlayerConfig } from "@/data/types/setup";

interface ArchiveSetupBlockProps {
    playerConfig: PlayerConfig;
    onConfigChange: (config: PlayerConfig) => void;
    side: 'black' | 'white';
}

const ArchiveSetupBlock = ({ playerConfig, onConfigChange, side }: ArchiveSetupBlockProps) => {
    return (
        <div className="text-green-400">ArchiveSetupBlock</div>
    );
}

export default ArchiveSetupBlock;
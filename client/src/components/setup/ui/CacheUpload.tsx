


import { PlayerConfig } from '@/data/types/setup';

interface CacheUploadProps {
    playerConfig: PlayerConfig;
    onConfigChange: (config: PlayerConfig) => void;
    side: 'black' | 'white';
}

const CacheUpload = ({ playerConfig, onConfigChange, side }: CacheUploadProps) => {
    return (
        <div className="text-green-400">CacheUpload </div>
    );
}

export default CacheUpload;
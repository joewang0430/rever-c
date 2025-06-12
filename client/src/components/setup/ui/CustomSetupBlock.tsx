import { PlayerConfig } from "@/data/types/setup";
import CacheUpload from "./CacheUpload";
import CandidateUpload from "./CandidateUpload";

interface CustomSetupBlockProps {
    playerConfig: PlayerConfig;
    onConfigChange: (config: PlayerConfig) => void;
    side: 'black' | 'white';
}

const CustomSetupBlock = ({ playerConfig, onConfigChange, side }: CustomSetupBlockProps) => {
  return (
    <div className="text-blue-400">
      <h2>CustomSetupBlock</h2>
    </div>
  );
};

export default CustomSetupBlock;
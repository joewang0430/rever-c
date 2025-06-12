import CacheUpload from "./CacheUpload";
import CandidateUpload from "./CandidateUpload";

interface CustomSetupBlockProps {
    matchId: string;
};

const CustomSetupBlock = ({matchId} : CustomSetupBlockProps) => {
  return (
    <div className="text-blue-400">
      <h2>Cache / Candidate</h2>
      <CacheUpload matchId={matchId}/>
      <CandidateUpload matchId={matchId}/>
    </div>
  );
};

export default CustomSetupBlock;
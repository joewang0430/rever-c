import CacheUpload from "./ui/CacheUpload";
import CandidateUpload from "./ui/CandidateUpload";

const CustomSetupBlock = () => {
  return (
    <div className="text-blue-400">
      <h2>Cache / Candidate</h2>
      <CacheUpload />
      <CandidateUpload />
    </div>
  );
};

export default CustomSetupBlock;
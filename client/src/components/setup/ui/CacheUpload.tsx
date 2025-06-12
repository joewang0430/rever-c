interface CandidateSetupBlockProps {
    matchId?: string;
};

const CacheUpload = ({matchId} : CandidateSetupBlockProps) => {
    return (
        <div className="text-green-400">CacheUpload: {matchId || 'No matchId'} </div>
    );
}

export default CacheUpload;
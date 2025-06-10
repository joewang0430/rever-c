interface CustomSetupBlockProps {
    matchId: string;
};

const CandidateUpload = ({matchId} : CustomSetupBlockProps) => {
    return (
        <div className="text-green-400">CandidateUpload: {matchId} </div>
    );
}

export default CandidateUpload;
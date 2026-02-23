//
// Placeholder block when no player type is selected
//

const NullSetupBlock = () => {
    return (
        <div className="h-[26.5rem] bg-gray-100 rounded-sm flex flex-col justify-center items-center">
            <div className="text-center space-y-2">
                <p className="text-gray-400 text-sm">
                    Please select a player to start the game
                </p>
            </div>
        </div>
    );
}

export default NullSetupBlock;
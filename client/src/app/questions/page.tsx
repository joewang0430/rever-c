//
// FAQs Page.
//

"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";

interface FAQItem {
    question: string;
    answer: string;
}

const faqData: FAQItem[] = [
    {
        question: "How do I write my own bot?",
        answer: "Your bot needs to implement this function: int makeMove(const char board[][26], int n, char turn, int *row, int *col). The function receives the current board state, board size, and whose turn it is. You need to set *row and *col to your chosen move position. Return any integer value."
    },
    {
        question: "What does the board array look like?",
        answer: "The board is a 2D char array where 'B' represents black pieces, 'W' represents white pieces, and 'U' represents unoccupied spaces. The array is indexed from [0][0] (top-left) to [n-1][n-1] (bottom-right)."
    },
    {
        question: "APS105 Student: do I need to modify anything for lab8part2.c to fit this platform?",
        answer: "No, you don't need to. lab8part2.c can be directly ran by ReverC (as two header files lab8part2.h and liblab8part2.h can be recognized), unless you have included some forbidden libraries or keywords, or simply have code errors."
    },
    {
        question: "What is the time limit for each move?",
        answer: "Your makeMove() function has 3 seconds to return a valid move. If your code exceeds this time limit, the game will end and your opponent wins. **Important for APS105 students: 3s is the limit for ReverC server, you need to ensure your code run within 1s to meet the lab8 requirements."
    },
    {
        question: "Is the time measurement accurate?",
        answer: "The time measured by ReverC does not guarantee to be as accurate as your own PC or UofT test cases, since ReverC server may facing frequent requests, causing CPU threads to be busy. It is recommended that APS105 students to be subject to the test results of the school machine."
    },
    {
        question: "What is 'Temporary Code' vs 'Stored Code'?",
        answer: "Temporary Code is uploaded for a single session and deleted after the game or when you leave the page. Stored Code is saved and can be reused across multiple games, but it will be automatically deleted after 36 hours."
    },
    {
        question: "What are the daily usage limits?",
        answer: "To ensure fair usage: you can upload code up to 50 times per day, start up to 200 games per day, and use AI opponents up to 10 times per day. These limits reset at midnight."
    },
    {
        question: "Why did my code fail to compile?",
        answer: "Common reasons include: missing semicolons, undefined functions, incorrect function signature, or using libraries not available on the server. Make sure your code compiles locally with gcc before uploading."
    },
    {
        question: "What is rvc.h?",
        answer: "rvc.h is a helper library provided by ReverC (not the APS105 teaching team). It provides four ready-made functions: rvc_in_bounds() to check if a position is within bounds, rvc_occupied() to check if a position is occupied, rvc_position_legal_direction() to check legality in one direction, and rvc_position_legal() to check if a move is legal. These help you quickly test your code pipeline if you haven't finish basic functions, though they may not be the most runtime-efficient."
    },
    {
        question: "What keywords are forbidden in my C code?",
        answer: "For security reasons, the following are not allowed in your code: #include <unistd.h>, #include <sys/...>, #include <signal.h>, system(), exec(), fork(), kill(), exit(), __asm__, and asm(). These prevent system calls, process operations, and assembly code that could harm the server."
    },
    {
        question: "How do I report a bug or suggest a feature?",
        answer: "You can contact the developer via email at icedeverjoe@outlook.com, or open an issue on the GitHub repository at github.com/joewang0430/rever-c. ReverC is still a work in progress, so you might run into some bugs. Thanks for your patience!"
    }
];

export default function QuestionPage() {
    const [openIndex, setOpenIndex] = useState<number | null>(null);

    const toggleQuestion = (index: number) => {
        setOpenIndex(openIndex === index ? null : index);
    };

    return (
        <main className="min-h-screen bg-gray-50 py-12 px-4">
            <div className="h-12"></div>
            <div className="max-w-3xl mx-auto">
                {/* Header */}
                <div className="text-center mb-10">
                    <h1 className="text-3xl font-bold text-gray-800 mb-2">
                        Frequently Asked Questions
                    </h1>
                </div>

                {/* FAQ Items */}
                <div className="space-y-3">
                    {faqData.map((item, index) => (
                        <div 
                            key={index}
                            className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden"
                        >
                            {/* Question Header */}
                            <button
                                onClick={() => toggleQuestion(index)}
                                className="w-full px-6 py-4 flex items-center justify-between text-left hover:bg-gray-50 transition-colors"
                            >
                                <span className="font-medium text-gray-800 pr-4">
                                    {item.question}
                                </span>
                                <ChevronDown 
                                    className={`w-5 h-5 text-gray-500 flex-shrink-0 transition-transform duration-200 ${
                                        openIndex === index ? 'rotate-180' : ''
                                    }`}
                                />
                            </button>

                            {/* Answer Content */}
                            <div 
                                className={`overflow-hidden transition-all duration-200 ease-in-out ${
                                    openIndex === index ? 'max-h-96' : 'max-h-0'
                                }`}
                            >
                                <div className="px-6 pb-4 text-gray-600 border-t border-gray-100 pt-4">
                                    {item.answer}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </main>
    );
}
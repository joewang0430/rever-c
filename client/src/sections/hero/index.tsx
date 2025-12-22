//
// Hero page section.
//

import StartButton from "@/components/home/StartButton";
import CasheBlockHome from '@/components/home/CacheBlockHome';
import BoardPreview from "../../components/home/BoardPreview";

export default function Hero () {
    return (
        <section id="hero" className="min-h-screen w-full flex flex-col items-center justify-start bg-rvc-primary-white">
            {/* 顶部留白，避免与 NavBar 重叠 */}
            <div className="h-20" />

            {/* 中心主位：动画棋盘预览 */}
            <div className="w-full flex items-center justify-center py-6">
                <BoardPreview size={8} />
            </div>

            {/* 功能标语与函数签名 */}
            <div className="px-6 text-center max-w-3xl">
                <p className="rvct-theme text-rvc-text-black/80 mb-2">Play reversi with your own .c function:</p>
                <p className="rvct-theme-700 text-xl md:text-2xl text-rvc-text-black">
                    int makeMove(const char board[][26], int n, char turn, int *row, int *col);
                </p>
            </div>

            {/* 开始游戏按钮（仅 UI） */}
            <div className="mt-6">
                <StartButton />
            </div>

            {/* What is ReverC? 按钮（暂不实现跳转） */}
            <div className="mt-6">
                <button
                    className="rvct-theme underline text-rvc-primary-black hover:text-rvc-primary-green transition-colors"
                    aria-label="What is ReverC?"
                >
                    What is ReverC?
                </button>
            </div>

            {/* 页面下方缓存状态（原有组件占位） */}
            <div className="mt-10 w-full max-w-5xl px-4">
                <CasheBlockHome />
            </div>
        </section>
    );
}



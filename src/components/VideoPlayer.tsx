import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown } from 'lucide-react';

interface VideoPlayerProps {
  title: string;
  posterUrl: string;
  videoUrls: {
    '1080p': string;
    '720p': string;
    '480p': string;
  };
  defaultQuality?: '1080p' | '720p' | '480p';
}

export default function VideoPlayer({
  title,
  posterUrl,
  videoUrls,
  defaultQuality = '720p',
}: VideoPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [currentQuality, setCurrentQuality] = useState<'1080p' | '720p' | '480p'>(defaultQuality);
  const [isLoading, setIsLoading] = useState(false);
  const [showQualityMenu, setShowQualityMenu] = useState(false);
  const [hasQuality, setHasQuality] = useState({
    '1080p': !!videoUrls['1080p'],
    '720p': !!videoUrls['720p'],
    '480p': !!videoUrls['480p'],
  });

  // 处理清晰度切换
  const handleQualityChange = (quality: '1080p' | '720p' | '480p') => {
    if (videoRef.current && quality !== currentQuality && hasQuality[quality]) {
      const currentTime = videoRef.current.currentTime;
      setIsLoading(true);
      setCurrentQuality(quality);
      setShowQualityMenu(false);

      // 切换视频源并保持播放进度
      if (videoRef.current) {
        videoRef.current.src = videoUrls[quality];
        videoRef.current.currentTime = currentTime;
        videoRef.current.play().catch(() => {
          // 如果播放失败，可能是因为浏览器暂停了自动播放
          console.warn('Autoplay failed, user interaction might be required');
        });
      }
    }
  };

  // 获取清晰度显示标签
  const getQualityLabel = (quality: '1080p' | '720p' | '480p') => {
    if (!hasQuality[quality]) return `${quality} (不可用)`;
    return quality;
  };

  return (
    <div className="relative w-full bg-black rounded-xl overflow-hidden shadow-lg">
      {/* 视频容器 */}
      <div className="relative aspect-video bg-black">
        <video
          ref={videoRef}
          className="w-full h-full"
          controls
          poster={posterUrl}
          onLoadStart={() => setIsLoading(true)}
          onCanPlay={() => setIsLoading(false)}
          onLoadedMetadata={() => setIsLoading(false)}
        >
          <source src={videoUrls[currentQuality]} type="video/mp4" />
          您的浏览器不支持视频播放。
        </video>

        {/* 加载状态指示 */}
        {isLoading && (
          <div className="absolute inset-0 bg-black/60 flex items-center justify-center backdrop-blur-sm">
            <div className="text-white text-center">
              <div className="w-12 h-12 border-4 border-white border-t-blue-500 rounded-full animate-spin mx-auto mb-3"></div>
              <p className="text-sm font-medium">加载中 {currentQuality}...</p>
            </div>
          </div>
        )}

        {/* 清晰度切换按钮 */}
        <div className="absolute top-4 right-4 z-40">
          <div className="relative">
            {/* 清晰度按钮 */}
            <button
              onClick={() => setShowQualityMenu(!showQualityMenu)}
              className="px-4 py-2 bg-black/70 hover:bg-black text-white rounded-lg text-sm font-semibold flex items-center gap-2 transition-all duration-200 backdrop-blur-sm border border-white/20"
              aria-label="选择清晰度"
            >
              <span className="font-bold">{currentQuality}</span>
              <ChevronDown
                size={16}
                className={`transition-transform duration-200 ${showQualityMenu ? 'rotate-180' : ''}`}
              />
            </button>

            {/* 清晰度菜单 */}
            {showQualityMenu && (
              <div className="absolute top-full right-0 mt-2 bg-black/95 rounded-lg overflow-hidden shadow-xl backdrop-blur-sm border border-white/20 min-w-[160px] animate-fade-in">
                {(['1080p', '720p', '480p'] as const).map((quality) => (
                  <button
                    key={quality}
                    onClick={() => handleQualityChange(quality)}
                    disabled={!hasQuality[quality]}
                    className={`w-full px-4 py-2.5 text-sm text-left transition-all duration-150 flex items-center justify-between ${
                      currentQuality === quality
                        ? 'bg-blue-600 text-white font-semibold'
                        : hasQuality[quality]
                          ? 'text-gray-200 hover:bg-white/10'
                          : 'text-gray-600 cursor-not-allowed opacity-50'
                    }`}
                  >
                    <span>{getQualityLabel(quality)}</span>
                    {currentQuality === quality && <span className="text-xs">✓</span>}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 视频信息底部 */}
      <div className="p-4 bg-gradient-to-t from-black to-black/80 text-white">
        <h3 className="font-bold text-base md:text-lg">{title}</h3>
        <p className="text-xs md:text-sm text-gray-400 mt-1.5 flex items-center gap-2">
          <span>当前清晰度: <span className="font-semibold text-white">{currentQuality}</span></span>
          <span className="text-gray-600">•</span>
          <span>支持拖拽进度条</span>
        </p>
      </div>

      {/* 样式定义 */}
      <style>{`
        @keyframes fade-in {
          from {
            opacity: 0;
            transform: translateY(-4px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-fade-in {
          animation: fade-in 0.2s ease-out;
        }
      `}</style>
    </div>
  );
}

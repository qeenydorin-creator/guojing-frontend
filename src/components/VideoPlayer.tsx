import React, { useRef } from 'react';

interface VideoPlayerProps {
  title: string;
  posterUrl: string;
  videoUrl: string;
}

export default function VideoPlayer({
  title,
  posterUrl,
  videoUrl,
}: VideoPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);

  return (
    <div className="relative w-full bg-black rounded-xl overflow-hidden shadow-lg">
      {/* 视频容器 */}
      <div className="relative aspect-video bg-black">
        <video
          ref={videoRef}
          className="w-full h-full"
          controls
          poster={posterUrl}
          preload="metadata"
        >
          <source src={videoUrl} type="video/mp4" />
          您的浏览器不支持视频播放。
        </video>
      </div>

      {/* 视频信息底部 */}
      <div className="p-4 bg-gradient-to-t from-black to-black/80 text-white">
        <h3 className="font-bold text-base md:text-lg">{title}</h3>
        <p className="text-xs md:text-sm text-gray-400 mt-1.5">
          支持拖拽进度条播放
        </p>
      </div>
    </div>
  );
}

import HomePage from "@/components/HomePage";
import { useRouter } from "expo-router";
import React from "react";

export default function HomeScreen() {
  const router = useRouter();

  const handleVideoPress = (videoId: string) => {
    // Navigate to detail page
    router.push(`/video/${videoId}`);
  };

  const handlePlayVideo = (videoId: string) => {
    // Navigate to video player
    router.push(`/player/${videoId}`);
  };

  return (
    <HomePage onVideoPress={handleVideoPress} onPlayVideo={handlePlayVideo} />
  );
}

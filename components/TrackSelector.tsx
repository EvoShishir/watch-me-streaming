import { AudioTrack, Subtitle } from "@/types";
import React from "react";
import {
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";

interface TrackSelectorProps {
  visible: boolean;
  onClose: () => void;
  subtitles?: Subtitle[];
  audioTracks?: AudioTrack[];
  selectedSubtitle?: string;
  selectedAudioTrack?: string;
  onSubtitleSelect: (subtitleId: string | null) => void;
  onAudioTrackSelect: (trackId: string) => void;
}

export default function TrackSelector({
  visible,
  onClose,
  subtitles = [],
  audioTracks = [],
  selectedSubtitle,
  selectedAudioTrack,
  onSubtitleSelect,
  onAudioTrackSelect,
}: TrackSelectorProps) {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.container}>
          <View style={styles.header}>
            <Text style={styles.title}>Audio & Subtitles</Text>
            <Pressable onPress={onClose} style={styles.closeButton}>
              <Text style={styles.closeButtonText}>✕</Text>
            </Pressable>
          </View>

          <ScrollView
            style={styles.content}
            showsVerticalScrollIndicator={false}
          >
            {/* Audio Tracks */}
            {audioTracks.length > 0 && (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Audio</Text>
                {audioTracks.map((track) => (
                  <Pressable
                    key={track.id}
                    style={[
                      styles.trackItem,
                      selectedAudioTrack === track.id &&
                        styles.selectedTrackItem,
                    ]}
                    onPress={() => onAudioTrackSelect(track.id)}
                  >
                    <View style={styles.trackInfo}>
                      <Text
                        style={[
                          styles.trackLabel,
                          selectedAudioTrack === track.id &&
                            styles.selectedTrackLabel,
                        ]}
                      >
                        {track.label}
                      </Text>
                    </View>
                    {selectedAudioTrack === track.id && (
                      <Text style={styles.checkmark}>✓</Text>
                    )}
                  </Pressable>
                ))}
              </View>
            )}

            {/* Subtitles */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Subtitles</Text>

              {/* Off option */}
              <Pressable
                style={[
                  styles.trackItem,
                  !selectedSubtitle && styles.selectedTrackItem,
                ]}
                onPress={() => onSubtitleSelect(null)}
              >
                <View style={styles.trackInfo}>
                  <Text
                    style={[
                      styles.trackLabel,
                      !selectedSubtitle && styles.selectedTrackLabel,
                    ]}
                  >
                    Off
                  </Text>
                </View>
                {!selectedSubtitle && <Text style={styles.checkmark}>✓</Text>}
              </Pressable>

              {/* Available subtitles */}
              {subtitles.map((subtitle) => (
                <Pressable
                  key={subtitle.id}
                  style={[
                    styles.trackItem,
                    selectedSubtitle === subtitle.id &&
                      styles.selectedTrackItem,
                  ]}
                  onPress={() => onSubtitleSelect(subtitle.id)}
                >
                  <View style={styles.trackInfo}>
                    <Text
                      style={[
                        styles.trackLabel,
                        selectedSubtitle === subtitle.id &&
                          styles.selectedTrackLabel,
                      ]}
                    >
                      {subtitle.label}
                    </Text>
                  </View>
                  {selectedSubtitle === subtitle.id && (
                    <Text style={styles.checkmark}>✓</Text>
                  )}
                </Pressable>
              ))}
            </View>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.8)",
    justifyContent: "center",
    alignItems: "center",
  },
  container: {
    width: "85%",
    maxHeight: "70%",
    backgroundColor: "#1a1a1a",
    borderRadius: 12,
    overflow: "hidden",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#333",
  },
  title: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
  },
  closeButton: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: "#333",
    justifyContent: "center",
    alignItems: "center",
  },
  closeButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
  content: {
    maxHeight: 400,
  },
  section: {
    padding: 20,
  },
  sectionTitle: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 12,
  },
  trackItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    marginBottom: 8,
    backgroundColor: "#2a2a2a",
  },
  selectedTrackItem: {
    backgroundColor: "#e50914",
  },
  trackInfo: {
    flex: 1,
  },
  trackLabel: {
    color: "#ccc",
    fontSize: 16,
  },
  selectedTrackLabel: {
    color: "#fff",
    fontWeight: "bold",
  },
  checkmark: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
  },
});

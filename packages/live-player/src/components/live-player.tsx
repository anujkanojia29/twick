import { useEffect, useMemo, useRef } from "react";
import { Player as CorePlayer } from "@twick/core";
import { Player } from "@twick/player-react";
import { generateId, getBaseProject } from "../helpers/player.utils";
//@ts-ignore
import project from "@twick/visualizer/dist/project";

const DEFAULT_VIDEO_SIZE = {
  width: 720,
  height: 1280,
};

/**
 * Props for the LivePlayer component.
 * Defines the configuration options and callback functions for the live player.
 */
export type LivePlayerProps = {
  /** Whether the player should be playing or paused */
  playing: boolean;

  /** Dynamic project variables to feed into the player */
  projectData: any;

  /** Dimensions of the video player */
  videoSize?: {
    width: number;
    height: number;
  };

  /** Time in seconds to seek to on load or update */
  seekTime?: number;

  /** Style for the player container */
  containerStyle?: React.CSSProperties;

  /** Volume of the player */
  volume?: number;

  /** Playback quality level */
  quality?: number;

  /** Callback fired on time update during playback */
  onTimeUpdate?: (currentTime: number) => void;

  /** Callback fired when player data is updated */
  onPlayerUpdate?: (event: CustomEvent) => void;

  /** Callback fired once the player is ready */
  onPlayerReady?: (player: CorePlayer) => void;

  /** Callback fired when the video duration is loaded */
  onDurationChange?: (duration: number) => void;
};

/**
 * LivePlayer is a React component that wraps around the @twick/player-react player.
 * Supports dynamic project variables, external control for playback, time seeking,
 * volume and quality adjustment, and lifecycle callbacks.
 *
 * @param props - Props to control the player and respond to its state
 * @returns A configured player UI component
 * 
 * @example
 * ```jsx
 * <LivePlayer
 *   playing={true}
 *   projectData={{ text: "Hello World" }}
 *   videoSize={{ width: 720, height: 1280 }}
 *   onTimeUpdate={(time) => console.log('Current time:', time)}
 *   onPlayerReady={(player) => console.log('Player ready:', player)}
 * />
 * ```
 */
export const LivePlayer = ({
  playing,
  containerStyle,
  projectData,
  videoSize,
  seekTime = 0,
  volume = 0.25,
  quality = 0.5,
  onTimeUpdate,
  onPlayerUpdate,
  onPlayerReady,
  onDurationChange,
}: LivePlayerProps) => {
  

  const isFirstRender = useRef(false);

  const playerRef = useRef<{
    id: string;
    player: CorePlayer | null;
    htmlElement: HTMLElement | null;
  }>({ id: generateId(), player: null, htmlElement: null });

  const baseProject = useMemo(
    () => getBaseProject(videoSize || DEFAULT_VIDEO_SIZE, playerRef.current.id),
    [videoSize]
  );
  const playerContainerRef = useRef<HTMLDivElement | null>(null);

  /**
   * Handle time updates from the player and relay to external callback.
   * Processes time update events and forwards them to the onTimeUpdate prop
   * if provided.
   *
   * @param currentTime - The current playback time in seconds
   * 
   * @example
   * ```js
   * onCurrentTimeUpdate(5.5);
   * // Triggers onTimeUpdate callback with 5.5 seconds
   * ```
   */
  const onCurrentTimeUpdate = (currentTime: number) => {
    if (onTimeUpdate) {
      onTimeUpdate(currentTime);
    }
  };

  /**
   * Handle player ready lifecycle and store references.
   * Called when the player is fully initialized and ready for use.
   * Stores player references and triggers the onPlayerReady callback.
   *
   * @param player - The initialized CorePlayer instance
   * 
   * @example
   * ```js
   * handlePlayerReady(playerInstance);
   * // Stores player reference and triggers onPlayerReady callback
   * ```
   */
  const handlePlayerReady = (player: CorePlayer) => {
    playerRef.current = {
      player,
      id: playerRef.current.id,
      htmlElement:
        playerContainerRef.current?.querySelector("twick-player") || null,
    };

    if (!isFirstRender.current) {
      onFirstRender();
      isFirstRender.current = true;

      if (onPlayerReady) {
        onPlayerReady(player);
      }
    }
  };

  /**
   * Performs setup only once after the player has rendered for the first time.
   * Hides unnecessary UI elements and applies initial project data
   * to ensure proper player initialization.
   * 
   * @example
   * ```js
   * onFirstRender();
   * // Hides UI elements and sets initial project data
   * ```
   */
  const onFirstRender = () => {
    if (playerRef.current?.player && playerRef.current.htmlElement) {
      playerRef.current.htmlElement?.nextElementSibling?.setAttribute(
        "style",
        "display: none;"
      );
      setProjectData(projectData);
    }
  };

  /**
   * Applies JSON variables to the player element.
   * Converts project data to JSON and sets it as an attribute
   * on the player HTML element for dynamic content updates.
   *
   * @param projectData - The project data to apply to the player
   * 
   * @example
   * ```js
   * setProjectData({ text: "Updated content", color: "red" });
   * // Updates player with new project variables
   * ```
   */
  const setProjectData = (projectData: any) => {
    if (playerRef.current?.htmlElement && projectData) {
      console.log("setProjectData in live player");
      playerRef.current.htmlElement.setAttribute(
        "variables",
        JSON.stringify({ ...projectData, playerId: playerRef.current.id })
      );
    }
  };

  /**
   * Handles player update events from the Twick player.
   * Filters events by player ID and forwards them to the onPlayerUpdate callback
   * if provided. This ensures only events for this specific player instance
   * are processed.
   *
   * @param event - Custom event containing player update information
   * 
   * @example
   * ```js
   * handleUpdate(customEvent);
   * // Forwards event to onPlayerUpdate if playerId matches
   * ```
   */
  const handleUpdate = (event: CustomEvent) => {
    if (event.detail.playerId === playerRef.current.id) {
      if (onPlayerUpdate) {
        onPlayerUpdate(event);
      }
    }
  };

  // Apply new project data whenever it changes
  useEffect(() => {
    setProjectData(projectData);
  }, [projectData]);

  // Play/pause player based on external prop
  useEffect(() => {
    if (playerRef.current?.player) {
      playerRef.current.player.togglePlayback(playing);
    }
  }, [playing]);

  useEffect(() => {
    if (typeof window !== "undefined") {
      window.addEventListener(
        "twick:playerUpdate",
        handleUpdate as EventListener
      );
    }
    return () => {
      if (typeof window !== "undefined") {
        window.addEventListener(
          "twick:playerUpdate",
          handleUpdate as EventListener
        );
      }
    };
  }, []);

  return (
    <div
      ref={playerContainerRef}
      style={{
        position: "relative",
        display: "flex",
        width: "100%",
        height: "100%",
        justifyContent: "center",
        alignItems: "center",
        ...(containerStyle || {}),
      }}
    >
      <Player
        project={project}
        looping={false}
        controls={false}
        currentTime={seekTime}
        variables={baseProject}
        volume={volume}
        quality={quality}
        onTimeUpdate={onCurrentTimeUpdate}
        onPlayerReady={handlePlayerReady}
        width={baseProject.input?.properties?.width || DEFAULT_VIDEO_SIZE.width}
        height={
          baseProject?.input?.properties?.height || DEFAULT_VIDEO_SIZE.height
        }
        timeDisplayFormat="MM:SS.mm"
        onDurationChange={(e) => {
          if (onDurationChange) {
            onDurationChange(e);
          }
        }}
      />
    </div>
  );
};

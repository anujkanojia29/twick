import {
  createContext,
  useContext,
  useState,
  useEffect,
  useMemo,
  useRef,
} from "react";
import { TIMELINE_ACTION } from "../utils/constants";
import { UndoRedoProvider, useUndoRedo } from "./undo-redo-context";
import { Track } from "../core/track/track";
import { TrackElement } from "../core/elements/base.element";
import { ProjectJSON, Size, TrackJSON } from "../types";
import { TimelineEditor } from "../core/editor/timeline.editor";
import { editorRegistry } from "../utils/register-editor";
import { PostHogProvider } from "posthog-js/react";
import posthog from "posthog-js";

/**
 * Type definition for the Timeline context.
 * Contains all the state and functions needed to manage a timeline instance.
 * Provides access to the timeline editor, selected items, undo/redo functionality,
 * and timeline actions.
 * 
 * @example
 * ```js
 * const {
 *   editor,
 *   selectedItem,
 *   totalDuration,
 *   canUndo,
 *   canRedo,
 *   setSelectedItem,
 *   setTimelineAction
 * } = useTimelineContext();
 * ```
 */
export type TimelineContextType = {
  /** Unique identifier for this timeline context */
  contextId: string;
  /** The timeline editor instance for this context */
  editor: TimelineEditor;
  /** Currently selected track or element */
  selectedItem: Track | TrackElement | null;
  /** Change counter for tracking modifications */
  changeLog: number;
  /** Current timeline action being performed */
  timelineAction: {
    type: string;
    payload: any;
  };
  /** Resolution of the video */
  videoResolution: Size;
  /** Total duration of the timeline in seconds */
  totalDuration: number;
  /** Current project state */
  present: ProjectJSON | null;
  /** Whether undo operation is available */
  canUndo: boolean;
  /** Whether redo operation is available */
  canRedo: boolean;
  /** Function to set the selected item */
  setSelectedItem: (item: Track | TrackElement | null) => void;
  /** Function to set timeline actions */
  setTimelineAction: (type: string, payload: any) => void;
  /** Function to set the video resolution */
  setVideoResolution: (size: Size) => void;
};

const TimelineContext = createContext<TimelineContextType | undefined>(
  undefined
);

/**
 * Props for the TimelineProvider component.
 * Defines the configuration options for timeline context initialization.
 * 
 * @example
 * ```jsx
 * <TimelineProvider
 *   contextId="my-timeline"
 *   initialData={{ tracks: [], version: 1 }}
 *   undoRedoPersistenceKey="timeline-state"
 *   maxHistorySize={50}
 * >
 *   <YourApp />
 * </TimelineProvider>
 * ```
 */
export interface TimelineProviderProps {
  /** React children to wrap with timeline context */
  children: React.ReactNode;
  /** Unique identifier for this timeline context */
  contextId: string;
  /** resolution of the video */
  resolution?: Size;
  /** Initial timeline data to load */
  initialData?: {
    tracks: TrackJSON[];
    version: number;
  };
  /** Key for persisting undo/redo state */
  undoRedoPersistenceKey?: string;
  /** Maximum number of history states to keep */
  maxHistorySize?: number;
}

/**
 * Inner component that uses the UndoRedo context.
 * Manages the timeline state and provides the timeline editor instance.
 * Handles initialization of timeline data and editor setup.
 *
 * @param props - Timeline provider configuration
 * @returns Timeline context provider with state management
 * 
 * @example
 * ```jsx
 * <TimelineProviderInner
 *   contextId="my-timeline"
 *   resolution={{ width: 1920, height: 1080 }}
 *   initialData={{ tracks: [], version: 1 }}
 * >
 *   <YourApp />
 * </TimelineProviderInner>
 * ```
 */
const TimelineProviderInner = ({
  contextId,
  children,
  resolution,
  initialData,
}: TimelineProviderProps) => {
  const [timelineAction, setTimelineActionState] = useState<{
    type: string;
    payload: any;
  }>({
    type: TIMELINE_ACTION.NONE,
    payload: null,
  });

  const [selectedItem, setSelectedItem] = useState<Track | TrackElement | null>(
    null
  );

  const [videoResolution, setVideoResolution] = useState<Size>(resolution);

  const [totalDuration, setTotalDuration] = useState(0);

  const [changeLog, setChangeLog] = useState(0);

  const undoRedoContext = useUndoRedo();

  const dataInitialized = useRef(false);

  /**
   * Updates the change log counter.
   * Called whenever the timeline is modified to track changes.
   * 
   * @example
   * ```js
   * updateChangeLog();
   * // Increments the change counter
   * ```
   */
  const updateChangeLog = () => {
    setChangeLog((prev) => prev + 1);
  };

  // Create a single editor instance that's shared across all components
  const editor = useMemo(() => {
    if (editorRegistry.has(contextId)) {
      editorRegistry.delete(contextId);
    } else {
      posthog.capture("timeline_editor_created", {
        contextId,
      });
    }
    const newEditor = new TimelineEditor({
      contextId,
      setTotalDuration,
      setPresent: undoRedoContext.setPresent,
      handleUndo: undoRedoContext.undo,
      handleRedo: undoRedoContext.redo,
      handleResetHistory: undoRedoContext.resetHistory,
      updateChangeLog: updateChangeLog,
      setTimelineAction: (action: string, payload?: unknown) => {
        setTimelineActionState({ type: action, payload });
      },
    });

    // Register the editor instance in the global registry
    editorRegistry.set(contextId, newEditor);

    return newEditor;
  }, [contextId]);

  /**
   * Sets a timeline action with optional payload.
   * Used to trigger timeline state changes and actions.
   *
   * @param type - The type of action to perform
   * @param payload - Optional data for the action
   * 
   * @example
   * ```js
   * setTimelineAction(TIMELINE_ACTION.SET_PLAYER_STATE, { playing: true });
   * ```
   */
  const setTimelineAction = (type: string, payload: any) => {
    setTimelineActionState({ type, payload });
  };

  /**
   * Initializes the timeline with project data.
   * Loads either persisted state or initial data into the editor.
   *
   * @param data - Project data to initialize with
   * 
   * @example
   * ```js
   * initialize(projectData);
   * // Loads project data into the timeline editor
   * ```
   */
  const initialize = (data: ProjectJSON) => {
    const lastPersistedState = undoRedoContext.getLastPersistedState();
    if (lastPersistedState) {
      editor.loadProject(lastPersistedState);
      return;
    } else {
      editor.loadProject(data);
    }
  };

  // Initialize timeline data if provided
  useEffect(() => {
    if (initialData && !dataInitialized.current) {
      initialize(initialData);
      dataInitialized.current = true;
    }
  }, [initialData]);

  const contextValue: TimelineContextType = {
    contextId,
    selectedItem,
    timelineAction,
    totalDuration,
    changeLog,
    videoResolution,
    present: undoRedoContext.present,
    canUndo: undoRedoContext.canUndo,
    canRedo: undoRedoContext.canRedo,
    setVideoResolution,
    setSelectedItem,
    setTimelineAction,
    editor, // Include the editor instance
  };

  return (
    <TimelineContext.Provider value={contextValue}>
      {children}
    </TimelineContext.Provider>
  );
};

/**
 * Provider component for the Timeline context.
 * Wraps the timeline functionality with PostHog analytics and undo/redo support.
 * Manages the global state for timeline instances including tracks, elements,
 * playback state, and history management.
 *
 * @param props - Timeline provider configuration
 * @returns Context provider with timeline state management
 * 
 * @example
 * ```jsx
 * <TimelineProvider
 *   contextId="my-timeline"
 *   initialData={{ tracks: [], version: 1 }}
 *   undoRedoPersistenceKey="timeline-state"
 * >
 *   <YourApp />
 * </TimelineProvider>
 * ```
 */
export const TimelineProvider = ({
  contextId,
  children,
  resolution = {width: 720, height: 1280},
  initialData,
  undoRedoPersistenceKey,
  maxHistorySize,
}: TimelineProviderProps) => {
  // If undo/redo is enabled, wrap with UndoRedoProvider
  return (
    <PostHogProvider
      apiKey="phc_XaPky8YDbZjqm4GkCWBsVmICZTOTgjascrsftSOoJUJ"
      options={{
        api_host: "https://us.i.posthog.com",
        defaults: "2025-05-24",
        disable_session_recording: true,
      }}
    >
      <UndoRedoProvider
        persistenceKey={undoRedoPersistenceKey}
        maxHistorySize={maxHistorySize}
      >
        <TimelineProviderInner
          resolution={resolution}
          initialData={initialData}
          contextId={contextId}
          undoRedoPersistenceKey={undoRedoPersistenceKey}
          maxHistorySize={maxHistorySize}
        >
          {children}
        </TimelineProviderInner>
      </UndoRedoProvider>
    </PostHogProvider>
  );
};

/**
 * Hook to access the Timeline context.
 * Provides access to timeline state, editor instance, and timeline management functions.
 * Must be used within a TimelineProvider component.
 *
 * @returns TimelineContextType object with all timeline state and controls
 * @throws Error if used outside of TimelineProvider
 * 
 * @example
 * ```js
 * const {
 *   editor,
 *   selectedItem,
 *   totalDuration,
 *   canUndo,
 *   canRedo,
 *   setSelectedItem,
 *   setTimelineAction
 * } = useTimelineContext();
 * 
 * // Access the timeline editor
 * const tracks = editor.getTracks();
 * 
 * // Check if undo is available
 * if (canUndo) {
 *   editor.undo();
 * }
 * 
 * // Set timeline action
 * setTimelineAction(TIMELINE_ACTION.SET_PLAYER_STATE, { playing: true });
 * ```
 */
export const useTimelineContext = () => {
  const context = useContext(TimelineContext);
  if (context === undefined) {
    throw new Error(
      "useTimelineContext must be used within a TimelineProvider"
    );
  }
  return context;
};

import { ElementVisitor } from "./element-visitor";
import { VideoElement } from "../elements/video.element";
import { AudioElement } from "../elements/audio.element";
import { ImageElement } from "../elements/image.element";
import { TextElement } from "../elements/text.element";
import { CaptionElement } from "../elements/caption.element";
import { IconElement } from "../elements/icon.element";
import { CircleElement } from "../elements/circle.element";
import { RectElement } from "../elements/rect.element";
import { Track } from "../track/track";
import { TrackFriend } from "../track/track.friend";

/**
 * ElementUpdater visitor for updating elements in tracks
 * Uses the visitor pattern to handle different element types
 * Implements the Friend Class Pattern for explicit access control
 */
export class ElementUpdater implements ElementVisitor<boolean> {
  private trackFriend: TrackFriend;

  constructor(track: Track) {
    this.trackFriend = track.createFriend();
  }

  visitVideoElement(element: VideoElement): boolean {
    return this.trackFriend.updateElement(element);
  }

  visitAudioElement(element: AudioElement): boolean {
    return this.trackFriend.updateElement(element);
  }

  visitImageElement(element: ImageElement): boolean {
    return this.trackFriend.updateElement(element);
  }

  visitTextElement(element: TextElement): boolean {
    return this.trackFriend.updateElement(element);
  }

  visitCaptionElement(element: CaptionElement): boolean {
    return this.trackFriend.updateElement(element);
  }

  visitIconElement(element: IconElement): boolean {
    return this.trackFriend.updateElement(element);
  }

  visitCircleElement(element: CircleElement): boolean {
    return this.trackFriend.updateElement(element);
  }

  visitRectElement(element: RectElement): boolean {
    return this.trackFriend.updateElement(element);
  }
} 
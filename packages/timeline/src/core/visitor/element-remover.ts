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

/**
 * ElementRemover visitor for removing elements from tracks
 * Uses the visitor pattern to handle different element types
 */
export class ElementRemover implements ElementVisitor<boolean> {
  private track: Track;

  constructor(track: Track) {
    this.track = track;
  }

  visitVideoElement(element: VideoElement): boolean {
    this.track.removeElement(element);
    return true;
  }

  visitAudioElement(element: AudioElement): boolean {
    this.track.removeElement(element);
    return true;
  }

  visitImageElement(element: ImageElement): boolean {
    this.track.removeElement(element);
    return true;
  }

  visitTextElement(element: TextElement): boolean {
    this.track.removeElement(element);
    return true;
  }

  visitCaptionElement(element: CaptionElement): boolean {
    this.track.removeElement(element);
    return true;
  }

  visitIconElement(element: IconElement): boolean {
    this.track.removeElement(element);
    return true;
  }

  visitCircleElement(element: CircleElement): boolean {
    this.track.removeElement(element);
    return true;
  }

  visitRectElement(element: RectElement): boolean {
    this.track.removeElement(element);
    return true;
  }
} 
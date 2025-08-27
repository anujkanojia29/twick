# @twick/live-player

A React component for video playback and control with advanced timeline support.

## Overview

This package provides a powerful video player component that supports complex timeline-based video playback, custom controls, and real-time rendering of video projects with multiple tracks and elements.

## Features

- Video playback with custom controls
- Time tracking and duration management
- Project data support for complex video configurations
- Customizable video dimensions
- Play/pause state management
- High-performance video rendering
- Timeline-based element rendering
- Real-time project updates

## Requirements

- React 18 or higher
- Browser environment with HTML5 Video support

## Installation

```bash
npm install @twick/live-player
# or
pnpm add @twick/live-player
```

## Quick Start

```tsx
import React, { useState } from "react";
import projectData from "./sample";
import { LivePlayer } from "@twick/live-player";

function VideoPlayerComp() {
  const [playing, setPlaying] = useState(false);

  return (
    <div>
      <button onClick={() => setPlaying((prev) => !prev)}>Toggle playback</button>
      <LivePlayer
        projectData={projectData} // Your video project configuration
        videoSize={{
          width: 720,
          height: 1280,
        }}
        playing={playing}
      />
    </div>
  );
}

export default VideoPlayerComp;
```

## Project Data Structure

```json
{
  "input": {
    "properties": {
      "width": 720,
      "height": 1280
    },
    "timeline": [
      {
        "id": "t-element",
        "type": "element",
        "elements": [
          {
            "id": "e-244f8d5a3baa",
            "type": "rect",
            "s": 0,
            "e": 5,
            "props": {
              "width": 720,
              "height": 1280,
              "fill": "#FFF000"
            }
          }
        ],
        "name": "element"
      },
      {
        "id": "t-element",
        "type": "element",
        "elements": [
          {
            "id": "e-244f8d5a3bba",
            "type": "text",
            "s": 0,
            "e": 1,
            "props": {
              "text": "Hello Guys!",
              "fontSize": 100,
              "fill": "#FF0000"
            }
          },
          {
            "id": "e-244f8d5a3bbb",
            "type": "text",
            "s": 1,
            "e": 4,
            "props": {
              "text": "Welcome to the world of Twick!",
              "fontSize": 100,
              "fill": "#FF0000",
              "maxWidth": 500,
              "textAlign": "center",
              "textWrap": true
            }
          }
        ],
        "name": "element"
      }
    ]
  },
  "version": 1
}
```

## API Reference

### Required Props

- `projectData`: Object containing video project configuration
- `videoSize`: Object specifying video dimensions
  ```typescript
  {
    width: number;
    height: number;
  }
  ```

### Optional Props

- `playing`: Boolean to control play/pause state
- `onDurationChange`: Callback function when video duration changes
- `onTimeUpdate`: Callback function for time updates during playback

### Components

- `LivePlayer`: Main video player component

### Types

- `LivePlayerProps`: Props interface for LivePlayer component
- `VideoSize`: Interface for video dimensions
- `ProjectData`: Interface for video project configuration

For complete API documentation, refer to [docs/modules.md](../../docs/modules.md).

## Browser Support

This library requires a browser environment with support for:
- HTML5 Video
- Modern JavaScript features (ES2020+)

## Documentation

- **API Reference**: [docs/modules.md](../../docs/modules.md) - Complete API documentation
- **Style Guide**: [STYLE_GUIDE.md](../../STYLE_GUIDE.md) - Coding standards and conventions
- **Main README**: [README.md](../../README.md) - Project overview and getting started

## License

Apache-2.0 
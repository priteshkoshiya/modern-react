import React, { useEffect } from "react";

declare global {
  namespace JSX {
    interface IntrinsicElements {
      "model-viewer": ModelViewerProps;
    }
  }
}

interface ModelViewerProps extends React.HTMLAttributes<HTMLElement> {
  src: string;
  "shadow-intensity"?: string;
  "camera-controls"?: boolean;
  "touch-action"?: string;
  style?: React.CSSProperties;
  className?: string;
  ref?: React.RefObject<any>; // Add the ref prop here
}

export const ModelViewer: React.FC = () => {
  useEffect(() => {
    import("@google/model-viewer");
  }, []);

  return (
    <div>
      <model-viewer
        src="https://modelviewer.dev/shared-assets/models/Astronaut.glb"
        shadow-intensity="1"
        camera-controls
        touch-action="pan-y"
        style={{ width: "100%", height: "450px" }}
        className="model-viewer"
      ></model-viewer>
    </div>
  );
};

import React from 'react';

declare global {
  namespace JSX {
    interface IntrinsicElements {
      'a-scene': any;
      'a-assets': any;
      'a-sky': any;
      'a-light': any;
      'a-circle': any;
      'a-entity': any;
      'a-box': any;
      'a-cylinder': any;
      'a-sphere': any;
      'a-torus': any;
      'a-plane': any;
      'a-text': any;
      'a-camera': any;
      'a-cursor': any;
      'a-sound': any;
      'a-image': any;
      'a-video': any;
      'a-gltf-model': any;
      'a-obj-model': any;
      [elemName: string]: any;
    }
  }
}

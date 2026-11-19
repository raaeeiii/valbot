/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-require-imports */
/// <reference types="vite/client" />

// Disable all Node.js types that cause conflicts
declare module 'express' { export = any; }
declare module 'express-rate-limit' { export = any; }
declare module 'mongoose' { export = any; }
declare module 'mongodb' { export = any; }

// React ecosystem modules
declare module 'framer-motion' { export * from 'framer-motion'; }
declare module 'react-router-dom' { export * from 'react-router-dom'; }
declare module 'zustand' { export * from 'zustand'; }
declare module 'zustand/middleware' { export * from 'zustand/middleware'; }
declare module '@heroicons/react/24/outline' { export * from '@heroicons/react/24/outline'; }
declare module '@heroicons/react/24/solid' { export * from '@heroicons/react/24/solid'; }

// Asset modules
declare module '*.css' {
  const content: { [className: string]: string };
  export default content;
}

declare module '*.module.css' {
  const classes: { [key: string]: string };
  export default classes;
}

declare module '*.svg' {
  import React = require('react');
  export const ReactComponent: React.FC<React.SVGProps<SVGSVGElement>>;
  const src: string;
  export default src;
}

declare module '*.png' { const content: string; export default content; }
declare module '*.jpg' { const content: string; export default content; }
declare module '*.jpeg' { const content: string; export default content; }
declare module '*.gif' { const content: string; export default content; }
declare module '*.webp' { const content: string; export default content; }

// Global type overrides
declare namespace JSX {
  interface IntrinsicElements {
    [elemName: string]: any;
  }
}

// Suppress all problematic Node.js globals
declare const process: any;
declare const global: any;
declare const Buffer: any;
declare const console: any;

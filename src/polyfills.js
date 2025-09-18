// Polyfills for Node.js modules in browser environment
import { Buffer } from 'buffer';
import process from 'process';

// Make Buffer and process globally available
if (typeof window !== 'undefined') {
  window.Buffer = Buffer;
  window.process = process;
  window.global = globalThis;
}

globalThis.Buffer = Buffer;
globalThis.process = process;

// Ensure global is defined
if (typeof global === 'undefined') {
  // eslint-disable-next-line no-global-assign
  global = globalThis;
}
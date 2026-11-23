import { createContext } from 'react';

/** When `reduced` is true, models skip idle animation and settle instantly (prefers-reduced-motion). */
export const MotionContext = createContext({ reduced: false });

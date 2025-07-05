import { Buffer } from 'buffer';
import process from 'process';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
(window as any).global  = window;      // WalletConnect expects global
// eslint-disable-next-line @typescript-eslint/no-explicit-any
(window as any).Buffer  ??= Buffer;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
(window as any).process ??= process;

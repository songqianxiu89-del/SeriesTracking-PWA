import { beforeEach, describe, expect, it, vi } from 'vitest';
import { fileToBase64, resolveImageSource } from '@/lib/storage';

function installIndexedDbMock(store: Map<string, Blob>) {
  const indexedDbMock = {
    open: vi.fn((_name: string, _version: number) => {
      const request: {
        result?: IDBDatabase;
        onupgradeneeded: null | (() => void);
        onsuccess: null | (() => void);
        onerror: null | (() => void);
        error: Error | null;
      } = {
        onupgradeneeded: null,
        onsuccess: null,
        onerror: null,
        error: null,
      };

      const db = {
        objectStoreNames: { contains: () => true },
        createObjectStore: () => undefined,
        transaction: (_storeName: string, mode: IDBTransactionMode) => {
          const tx = {
            oncomplete: null as null | (() => void),
            onerror: null as null | (() => void),
            onabort: null as null | (() => void),
            objectStore: () => ({
              put: (value: Blob, key: string) => {
                const putReq = { onsuccess: null as null | (() => void), onerror: null as null | (() => void), error: null as Error | null };
                queueMicrotask(() => {
                  store.set(key, value);
                  putReq.onsuccess?.();
                  tx.oncomplete?.();
                });
                return putReq;
              },
              get: (key: string) => {
                const getReq = {
                  onsuccess: null as null | (() => void),
                  onerror: null as null | (() => void),
                  error: null as Error | null,
                  get result() {
                    return store.get(key);
                  },
                };
                queueMicrotask(() => {
                  getReq.onsuccess?.();
                  tx.oncomplete?.();
                });
                return getReq;
              },
            }),
          };
          return tx;
        },
        close: () => undefined,
      };

      request.result = db as unknown as IDBDatabase;
      queueMicrotask(() => request.onsuccess?.());
      return request;
    }),
  };

  vi.stubGlobal('indexedDB', indexedDbMock as unknown as IDBFactory);
}

describe('storage image helpers', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('returns original src for non-indexed refs', async () => {
    await expect(resolveImageSource('data:image/png;base64,abc')).resolves.toBe('data:image/png;base64,abc');
  });

  it('stores uploaded files in indexedDB and returns id reference', async () => {
    installIndexedDbMock(new Map());

    const file = new File(['hello'], 'hello.txt', { type: 'text/plain' });
    const ref = await fileToBase64(file);

    expect(ref.startsWith('idbimg:')).toBe(true);
  });

  it('falls back to data-url when indexedDB fails', async () => {
    vi.stubGlobal('indexedDB', {
      open: () => {
        throw new Error('indexedDB blocked');
      },
    } as unknown as IDBFactory);

    const file = new File(['hello'], 'hello.txt', { type: 'text/plain' });
    const encoded = await fileToBase64(file);

    expect(encoded.startsWith('data:text/plain;base64,')).toBe(true);
  });
});

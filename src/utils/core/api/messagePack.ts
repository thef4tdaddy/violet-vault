import { encode, decode } from "@msgpack/msgpack";

/**
 * MessagePack Utility
 * Provides compact binary serialization for high-performance data transfer.
 * Used primarily for the Hyperspeed Demo (#172) and large sync operations.
 */

/**
 * Encodes data to a Uint8Array using MessagePack.
 */
export const serialize = (data: unknown): Uint8Array => {
  return encode(data);
};

/**
 * Decodes a MessagePack-encoded Uint8Array back to a JavaScript object.
 */
export const deserialize = <T>(buffer: Uint8Array | ArrayBuffer): T => {
  const uint8Array = buffer instanceof Uint8Array ? buffer : new Uint8Array(buffer);
  return decode(uint8Array) as T;
};

/**
 * Helper to fetch and automatically deserialize MessagePack responses.
 */
export const fetchMsgPack = async <T>(
  url: string,
  options: NonNullable<Parameters<typeof fetch>[1]> = {}
): Promise<T> => {
  const response = await fetch(url, {
    ...options,
    headers: {
      ...options.headers,
      Accept: "application/x-msgpack",
    },
  });

  if (!response.ok) {
    throw new Error(`MsgPack fetch failed: ${response.statusText}`);
  }

  const buffer = await response.arrayBuffer();
  return deserialize<T>(buffer);
};

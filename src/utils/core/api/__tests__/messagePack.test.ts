import { describe, it, expect } from "vitest";
import { serialize, deserialize } from "../messagePack";

describe("MessagePack Utility", () => {
  it("should serialize and deserialize objects", () => {
    const data = { id: 1, name: "Test", values: [1.5, 2.5] };
    const buffer = serialize(data);
    expect(buffer).toBeInstanceOf(Uint8Array);

    const decoded = deserialize<typeof data>(buffer);
    expect(decoded).toEqual(data);
  });

  it("should handle large arrays", () => {
    const data = Array.from({ length: 1000 }, (_, i) => i);
    const buffer = serialize(data);
    const decoded = deserialize<number[]>(buffer);
    expect(decoded).toEqual(data);
  });
});

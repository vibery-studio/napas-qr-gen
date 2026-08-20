import { describe, expect, it } from "vitest";
import { riskyChars, stripVn } from "./memo";

describe("stripVn", () => {
  it("folds diacritics and d-bar, keeps plus and spaces", () => {
    expect(stripVn("Thanh toán đơn +001+")).toBe("Thanh toan don +001+");
    expect(stripVn("Đông")).toBe("Dong");
  });
});

describe("riskyChars", () => {
  it("flags chars many banks reject", () => {
    expect(riskyChars("DH001 thanh toan")).toEqual([]);
    expect(riskyChars("a#b@c")).toEqual(["#", "@"]);
  });
});

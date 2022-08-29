import {
  assertAnd,
  assertDateFormat,
  assertEquals,
  assertNot,
  assertOr,
  assertProperty,
  assertSameConstructor,
  assertSchema,
  assertUrlFormat,
  assertUuidFormat,
} from "./asserts.ts";
import {
  assertBoolean,
  assertNull,
  assertObject,
  assertString,
  assertUndefined,
  describe,
  expect,
  it,
} from "./dev_deps.ts";

describe("assertSchema", () => {
  it("should throw error when schema#assert throw error", () => {
    expect(() =>
      assertSchema({
        assert() {
          throw Error();
        },
      }, null)
    ).toThrow();
  });

  it("should pass when schema#assert not throw error", () => {
    expect(
      assertSchema({
        assert() {
        },
      }, null),
    ).toBeUndefined();
  });
});

describe("assertOr", () => {
  it("should throw error when all assertions is fail", () => {
    expect(() =>
      assertOr([assertBoolean, assertUndefined, assertNull] as const, "")
    )
      .toThrow();
  });

  it("should pass when pass one of more assertion", () => {
    expect(
      assertOr(
        [],
        "",
      ),
    )
      .toBeUndefined();

    expect(
      assertOr(
        [assertBoolean, assertUndefined, assertNull, assertString] as const,
        "",
      ),
    )
      .toBeUndefined();
  });
});

describe("assertAnd", () => {
  it("should throw error when one or more assertions is fail", () => {
    expect(() => assertAnd([assertBoolean] as const, ""))
      .toThrow();

    expect(() => assertAnd([assertBoolean, assertNull] as const, undefined))
      .toThrow();
  });
});

describe("assertEquals", () => {
  it("should throw error when the value is not equal", () => {
    expect(() => assertEquals("", "a")).toThrow();
  });

  it("should throw error because default equality uses Object.is", () => {
    expect(() => assertEquals({}, {})).toThrow();
  });

  it("should pass when the value is equal", () => {
    expect(assertEquals("", "")).toBeUndefined();
    const obj = {};
    expect(assertEquals(obj, obj)).toBeUndefined();
  });

  it("should custom compare logic", () => {
    expect(
      assertEquals(
        {},
        {},
        (a, b) => Object(a)["constructor"] === Object(b)["constructor"],
      ),
    )
      .toBeUndefined();
  });
});

describe("assertProperty", () => {
  it("should throw error when the constructor is wrong", () => {
    expect(() => assertProperty("", {})).toThrow();
    expect(() => assertProperty([], {})).toThrow();
  });

  it("should throw error when the property value is not equal", () => {
    expect(() => assertProperty({ a: "" }, {})).toThrow();
    expect(() => assertProperty({ a: "" }, { a: "t" })).toThrow();
    expect(() => assertProperty({ a: "", b: 0 }, { a: "" })).toThrow();
    expect(() => assertProperty({ a: "", b: 0 }, { a: "", b: 1 })).toThrow();
    expect(() => assertProperty({ a: {} }, { a: {} })).toThrow();
  });

  it("should throw error when the property is not match to schema", () => {
    expect(
      () =>
        assertProperty({
          a: {
            assert(value: unknown): asserts value is object {
              assertObject(value);
            },
          },
        }, { a: "" }),
    ).toThrow();
  });

  it("should not throw error", () => {
    expect(assertProperty({}, { a: "" })).toBeUndefined();
    expect(assertProperty({ a: "" }, { a: "" })).toBeUndefined();
    expect(assertProperty({}, { a: "" })).toBeUndefined();
  });

  it("should not throw error when the schema record is nested object", () => {
    expect(
      assertProperty({
        a: {
          assert(value: unknown): asserts value is object {
            assertObject(value);

            assertProperty({
              b: {
                assert: assertString,
              },
            }, value);
          },
        },
      }, { a: { b: "" } }),
    ).toBeUndefined();
  });
});

describe("assertSameConstructor", () => {
  it("should throw error when the constructors is not equal", () => {
    expect(() => assertSameConstructor("", 0)).toThrow();
    expect(() => assertSameConstructor(null, 0)).toThrow();
    expect(() => assertSameConstructor(false, "")).toThrow();
    expect(() => assertSameConstructor("", {})).toThrow();
    expect(() => assertSameConstructor("", null)).toThrow();
    expect(() => assertSameConstructor("", undefined)).toThrow();
    expect(() => assertSameConstructor(0n, 0)).toThrow();
    expect(() => assertSameConstructor([], {})).toThrow();
  });

  it("should pass", () => {
    expect(assertSameConstructor(null, {})).toBeUndefined();
    expect(assertSameConstructor(undefined, {})).toBeUndefined();
    expect(assertSameConstructor(undefined, null)).toBeUndefined();
    expect(assertSameConstructor(undefined, new Object())).toBeUndefined();
    expect(assertSameConstructor({}, new Object())).toBeUndefined();
    expect(assertSameConstructor("", "a")).toBeUndefined();
    expect(assertSameConstructor([], [])).toBeUndefined();
  });
});

describe("assertNot", () => {
  it("should throw error when assertion is succeed", () => {
    expect(() => assertNot(assertString, "")).toThrow();
  });

  it("should success when assertion is failed", () => {
    expect(assertNot(assertString, 0)).toBeUndefined();
  });
});

describe("assertUuidFormat", () => {
  it("should throw error when the value is invalid UUID format", () => {
    expect(() => assertUuidFormat("")).toThrow();
  });

  it("should throw error when the value is valid UUID format", () => {
    expect(assertUuidFormat("00000000-0000-0000-0000-000000000000"))
      .toBeUndefined();
    expect(assertUuidFormat("6ec0bd7f-11c0-43da-975e-2a8ad9ebae0b"))
      .toBeUndefined();
  });
});

describe("assertUrlFormat", () => {
  it("should throw error when the value is invalid URL format", () => {
    expect(() => assertUrlFormat("")).toThrow();
    expect(() => assertUrlFormat("https")).toThrow();
    expect(() => assertUrlFormat("https:")).toThrow();
    expect(() => assertUrlFormat("https://")).toThrow();
  });

  it("should return undefined when the value is valid URL format", () => {
    expect(assertUrlFormat("https://a")).toBeUndefined();
    expect(assertUrlFormat("file:")).toBeUndefined();
    expect(assertUrlFormat(" file:")).toBeUndefined();
    expect(assertUrlFormat("  file:       ")).toBeUndefined();
  });
});

describe("assertDateFormat", () => {
  it("should throw error when the value is invalid date format", () => {
    expect(() => assertDateFormat("")).toThrow();
    expect(() => assertDateFormat("0000-00-00")).toThrow();
  });

  it("should return undefined when the value is date format", () => {
    expect(assertDateFormat("2000-01-01")).toBeUndefined();
  });
});

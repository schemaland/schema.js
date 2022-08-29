import { ReturnAssert, valueOf } from "./deps.ts";

export interface ScalerTypeMap {
  string: string;
  number: number;
  bigint: bigint;
  null: null;
  undefined: undefined;
  boolean: boolean;
  symbol: symbol;
}

export type Primitive = valueOf<ScalerTypeMap>;

export interface ObjectTypeMap {
  object: object;
  function: Function;
}

export interface SuperTypeMap extends ScalerTypeMap, ObjectTypeMap {}

export type SuperType = valueOf<SuperTypeMap>;

export type TypeStr = keyof SuperTypeMap;

/** Schema specification. */

export interface Schema<In = unknown, Out extends In = In> {
  /** Assert the {@link In input} is {@link Out output}. */
  assert: (value: In) => asserts value is Out;
}

/** Utility for unwrap schema.
 *
 * ```ts
 * import { UnwrapSchema, StringSchema, ObjectSchema } from "https://deno.land/x/schema_js@$VERSION/mod.ts";
 * const stringSchema = new StringSchema();
 * type a = UnwrapSchema<typeof stringSchema>; // string
 * const objectSchema = new Object({
 *  hello: stringSchema
 * })
 * type b = UnwrapSchema<typeof objectSchema>; // { hello: string }
 * ```
 */
export type UnwrapSchema<
  S,
> = S extends Schema<any> ? UnwrapSchema<ReturnAssert<S["assert"]>> : {
  [k in keyof S]: S[k] extends Schema<any>
    ? UnwrapSchema<ReturnAssert<S[k]["assert"]>>
    : S[k];
};

/** Type inference of TypeScript data types from the schema.
 *
 * ```ts
 * import {
 *   ArraySchema,
 *   InferSchema,
 *   NumberSchema,
 *   ObjectSchema,
 *   StringSchema,
 *   TupleSchema,
 * } from "https://deno.land/x/schema_js@$VERSION/mod.ts";
 *
 * const schema = new ObjectSchema({
 *   a: new StringSchema(),
 *   b: new ArraySchema().and(
 *     new TupleSchema(new StringSchema(), new NumberSchema()),
 *   ),
 *   c: new ObjectSchema({
 *     d: new NumberSchema(),
 *   }),
 * });
 *
 * type Schema = InferSchema<typeof schema>;
 * ```
 */
export type InferSchema<S extends Schema<any>> = ReturnAssert<S["assert"]>;

export type SchemaParameter<S extends Schema> = Parameters<S["assert"]>[0];

/** Schema context. */
export interface SchemaContext {
  /** Definition of equality.
   *
   * @default {@link Object.is}
   */
  equality: (a: unknown, b: unknown) => boolean;
}

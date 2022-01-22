import type { z } from 'zod';
import { InputSchema, Params, Procedure } from '..';

/***
 * Utility for creating a zod middleware
 */
export function zod<
  TInputParams extends Params<unknown>,
  TSchema extends z.ZodTypeAny,
>(
  schema: TSchema,
): Procedure<
  TInputParams,
  TInputParams & InputSchema<z.input<TSchema>, z.output<TSchema>>,
  { error: { code: 'BAD_REQUEST'; zod: z.ZodFormattedError<z.input<TSchema>> } }
> {
  type zInput = z.input<TSchema>;
  type zOutput = z.output<TSchema>;
  return async function parser(params) {
    const rawInput: zInput = (params as any).rawInput;
    const result: z.SafeParseReturnType<zInput, zOutput> =
      await schema.safeParseAsync(rawInput);

    if (result.success) {
      return {
        ...params,
        input: result,
        _input_in: null as any,
        _input_out: null as any,
      };
    }

    const zod = (result as z.SafeParseError<zInput>).error.format();
    return {
      error: {
        code: 'BAD_REQUEST',
        zod,
      },
    };
  };
}
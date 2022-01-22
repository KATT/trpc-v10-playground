import { MaybePromise, Params, Procedure, ProcedureResultError } from '..';

type IsProcedureResultErrorLike<T> = T extends ProcedureResultError ? T : never;
/**
 * Utility for creating operator that swaps the context around
 */
export function createNewContext<TInputParams extends Params<unknown>>() {
  return function newContextFactory<
    TNewContext,
    TError extends ProcedureResultError,
  >(
    newContextCallback: (
      params: TInputParams,
    ) => MaybePromise<
      { ctx: TNewContext } | IsProcedureResultErrorLike<TError>
    >,
  ) {
    return function newContext<
      TInputParams extends Params<unknown>,
    >(): Procedure<
      TInputParams,
      Omit<TInputParams, 'ctx'> & { ctx: NonNullable<TNewContext> },
      TError
    > {
      return async (params) => {
        const result = await newContextCallback(params as any);

        if ('ctx' in result) {
          return {
            ...params,
            ctx: result.ctx as NonNullable<TNewContext>,
          };
        }
        return result;
      };
    };
  };
}
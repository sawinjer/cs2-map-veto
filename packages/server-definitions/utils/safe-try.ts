type Callback<R> = () => R;
type AsyncCallback<R> = () => Promise<R>;
type Result<R> = [R, null] | [null, Error];

export const safeTry = <R>(callback: Callback<R>): Result<R> => {
  try {
    const result = callback();
    return [result, null];
  } catch (err) {
    return [null, err as Error];
  }
};

export const safeTryPromise = async <R>(
  callback: AsyncCallback<R>,
): Promise<Result<R>> => {
  try {
    const result = await callback();
    return [result, null];
  } catch (err) {
    return [null, err as Error];
  }
};

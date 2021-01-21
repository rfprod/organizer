export interface IActionPayload<T = void> {
  payload: T;
}

export const getActionCreator = (actionScope: string) => <
  T extends IActionPayload<void | unknown> = { payload: void }
>(
  actionName: string,
) =>
  class {
    public static readonly type: string = `[${actionScope}]: ${actionName}`;

    constructor(public payload: T['payload']) {}
  };

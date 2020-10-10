import { InjectionToken } from '@angular/core';

import { getNavigator, getWindow } from './providers';

export type TWindow = ReturnType<typeof getWindow>;

export const WINDOW = new InjectionToken<TWindow>('Window');

export type TNavigator = ReturnType<typeof getNavigator>;

export const NAVIGATOR = new InjectionToken<TNavigator>('Navigator');

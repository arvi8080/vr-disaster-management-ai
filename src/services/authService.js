import {api} from './api';
export const authService={get:()=>api('/auth')};
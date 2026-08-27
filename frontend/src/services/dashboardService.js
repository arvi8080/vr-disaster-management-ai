import {api} from './api';
export const dashboardService={get:()=>api('/dashboard')};
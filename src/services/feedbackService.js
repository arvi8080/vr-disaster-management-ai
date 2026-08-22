import {api} from './api';
export const feedbackService={get:()=>api('/feedback')};
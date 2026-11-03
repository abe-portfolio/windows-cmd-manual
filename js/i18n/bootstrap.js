import { getLanguage } from '../core/language.js';
import { localizeStatic } from './translations.js';
localizeStatic(document, getLanguage());

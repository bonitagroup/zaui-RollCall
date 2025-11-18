// ZaUI stylesheet
import 'zmp-ui/zaui.css';
// Tailwind stylesheet
import '@/css/tailwind.scss';
// Your stylesheet
import '@/css/app.scss';

// React core
import React from 'react';
import { createRoot } from 'react-dom/client';

// Expose app configuration
import appConfig from '../app-config.json';
import MyApp from './components/app';

if (!window.APP_CONFIG) {
  window.APP_CONFIG = appConfig as any;
}

const root = createRoot(document.getElementById('app')!);
root.render(React.createElement(MyApp));

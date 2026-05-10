import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { createBrowserRouter, Navigate, RouterProvider } from 'react-router-dom';
import { App } from './App';
import { AddRoutinePage } from './routes/AddRoutinePage';
import { EditRoutinePage } from './routes/EditRoutinePage';
import { HomePage } from './routes/HomePage';
import { StampCardPage } from './routes/StampCardPage';
import './index.css';

const router = createBrowserRouter([
  {
    path: '/',
    element: <App />,
    children: [
      { index: true, element: <HomePage /> },
      { path: 'add', element: <AddRoutinePage /> },
      { path: 'edit/:id', element: <EditRoutinePage /> },
      { path: 'stamps', element: <StampCardPage /> },
      { path: '*', element: <Navigate to="/" replace /> },
    ],
  },
]);

const rootEl = document.getElementById('root');
if (!rootEl) throw new Error('#root element missing');

createRoot(rootEl).render(
  <StrictMode>
    <RouterProvider router={router} />
  </StrictMode>
);

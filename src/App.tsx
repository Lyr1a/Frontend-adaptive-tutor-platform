import React from 'react';
import { ConfigProvider, Typography } from 'antd';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { theme } from './config/theme';
import './styles/globals.css';

const queryClient = new QueryClient();

const App: React.FC = () => (
  <QueryClientProvider client={queryClient}>
    <ConfigProvider theme={theme}>
      <main style={{ padding: 24 }}>
        <Typography.Title level={2}>TutorMatch</Typography.Title>
      </main>
    </ConfigProvider>
  </QueryClientProvider>
);

export default App;

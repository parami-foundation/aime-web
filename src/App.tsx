import { Layout } from 'antd';
import React, { useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import './App.scss';

const { Content } = Layout;

function App() {
  return (
    <div className='app'>
      <Layout>
        <Content className='content'>
          <Outlet></Outlet>
        </Content>
      </Layout>
    </div>
  );
}

export default App;

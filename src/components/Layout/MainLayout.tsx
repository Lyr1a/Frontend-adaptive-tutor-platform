import React, { useState, useEffect } from 'react';
import { Layout, Menu, Dropdown, Avatar, Badge, Button, List, Popover, Typography, Space, Grid } from 'antd';
import {
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  HomeOutlined,
  UserOutlined,
  SolutionOutlined,
  SearchOutlined,
  WalletOutlined,
  BarChartOutlined,
  LogoutOutlined,
  BellOutlined,
  LockOutlined,
  ClockCircleOutlined,
  StarOutlined,
  FileProtectOutlined,
  TeamOutlined,
  ExclamationCircleOutlined,
  UserAddOutlined,
} from '@ant-design/icons';
import { Link, useNavigate, useLocation, Outlet } from 'react-router-dom';
import { useAuthStore } from '../../stores';
import { notificationService } from '../../services';
import type { Notification } from '../../types';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';

dayjs.extend(relativeTime);

const { Header, Sider, Content } = Layout;
const { Text } = Typography;
const { useBreakpoint } = Grid;

interface MenuItem {
  key: string;
  icon: React.ReactNode;
  label: string;
  path: string;
}

const studentMenuItems: MenuItem[] = [
  { key: 'dashboard', icon: <HomeOutlined />, label: 'Home', path: '/student/dashboard' },
  { key: 'search', icon: <SearchOutlined />, label: 'Find Tutors', path: '/student/search-tutors' },
  { key: 'sessions', icon: <SolutionOutlined />, label: 'My Sessions', path: '/student/sessions' },
  { key: 'wallet', icon: <WalletOutlined />, label: 'Learning Credit Wallet', path: '/student/wallet' },
  { key: 'progress', icon: <BarChartOutlined />, label: 'Learning Progress', path: '/student/progress' },
  { key: 'profile', icon: <UserOutlined />, label: 'Profile', path: '/student/profile' },
];

const tutorMenuItems: MenuItem[] = [
  { key: 'dashboard', icon: <HomeOutlined />, label: 'Home', path: '/tutor/dashboard' },
  { key: 'sessions', icon: <SolutionOutlined />, label: 'Teaching Sessions', path: '/tutor/sessions' },
  { key: 'schedule', icon: <ClockCircleOutlined />, label: 'Availability', path: '/tutor/schedule' },
  { key: 'students', icon: <TeamOutlined />, label: 'Students', path: '/tutor/students' },
  { key: 'wallet', icon: <WalletOutlined />, label: 'Learning Credit Wallet', path: '/tutor/wallet' },
  { key: 'profile', icon: <UserOutlined />, label: 'Profile', path: '/tutor/profile' },
];

const adminMenuItems: MenuItem[] = [
  { key: 'dashboard', icon: <HomeOutlined />, label: 'Dashboard', path: '/admin/dashboard' },
  { key: 'tutors', icon: <UserAddOutlined />, label: 'Tutor Approvals', path: '/admin/tutors/pending' },
  { key: 'credits', icon: <StarOutlined />, label: 'Learning Credit Requests', path: '/admin/credits/pending' },
  { key: 'complaints', icon: <ExclamationCircleOutlined />, label: 'Complaints', path: '/admin/complaints' },
  { key: 'users', icon: <TeamOutlined />, label: 'User Management', path: '/admin/users' },
];

export const MainLayout: React.FC = () => {
  const [collapsed, setCollapsed] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuthStore();
  const screens = useBreakpoint();
  const isMobile = !screens.md;

  const getMenuItems = (): MenuItem[] => {
    switch (user?.role) {
      case 'Student':
        return studentMenuItems;
      case 'Tutor':
        return tutorMenuItems;
      case 'Administrator':
        return adminMenuItems;
      default:
        return [];
    }
  };

  const menuItems = getMenuItems();

  const getSelectedKey = (): string => {
    const currentPath = location.pathname;
    for (const item of menuItems) {
      if (currentPath.startsWith(item.path)) {
        return item.key;
      }
    }
    return 'dashboard';
  };

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const data = await notificationService.getAll();
        setNotifications(data);
      } catch (error) {
        // API may not exist yet — silently ignore 404/network errors
        setNotifications([]);
      }
    };
    
    if (user) {
      fetchNotifications();
      // Poll for new notifications every 30 seconds
      const interval = setInterval(fetchNotifications, 30000);
      return () => clearInterval(interval);
    }
  }, [user]);

  useEffect(() => {
    if (isMobile) {
      setCollapsed(true);
    }
  }, [isMobile]);

  const handleMenuClick = ({ key }: { key: string }) => {
    const item = menuItems.find((i) => i.key === key);
    if (item) {
      navigate(item.path);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  const notificationContent = (
    <div style={{ width: 'min(360px, calc(100vw - 32px))', maxHeight: 400, overflow: 'auto' }}>
      <div style={{ 
        padding: '12px 16px', 
        borderBottom: '1px solid #dedee5',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
      }}>
        <Text strong style={{ fontSize: 16 }}>Notifications</Text>
        {unreadCount > 0 && (
          <Button
            type="link"
            size="small"
            onClick={async () => {
              await notificationService.markAllAsRead();
              setNotifications((items) => items.map((item) => ({ ...item, isRead: true })));
            }}
          >
            Mark all as read
          </Button>
        )}
      </div>
      <List
        dataSource={notifications.slice(0, 10)}
        renderItem={(item) => (
          <List.Item
            style={{
              padding: '12px 16px',
              backgroundColor: item.isRead ? 'transparent' : 'rgba(113, 50, 245, 0.04)',
              cursor: 'pointer',
            }}
            onClick={() => {
              notificationService.markAsRead(item.id);
              setNotifications(notifications.map(n => n.id === item.id ? { ...n, isRead: true } : n));
            }}
          >
            <List.Item.Meta
              title={
                <Text strong={!item.isRead} style={{ fontSize: 14 }}>
                  {item.title}
                </Text>
              }
              description={
                <Space direction="vertical" size={0}>
                  <Text style={{ fontSize: 13, color: '#686b82' }}>{item.message}</Text>
                  <Text type="secondary" style={{ fontSize: 12 }}>
                    {dayjs(item.createdAt).fromNow()}
                  </Text>
                </Space>
              }
            />
          </List.Item>
        )}
        locale={{ emptyText: 'No notifications' }}
      />
    </div>
  );

  const userMenuItems = [
    {
      key: 'profile',
      icon: <UserOutlined />,
      label: 'Profile',
      onClick: () => navigate(user?.role === 'Student' ? '/student/profile' : user?.role === 'Tutor' ? '/tutor/profile' : '/admin/dashboard'),
    },
    {
      key: 'settings',
      icon: <LockOutlined />,
      label: 'Change password',
      onClick: () => navigate('/change-password'),
    },
    {
      type: 'divider' as const,
    },
    {
      key: 'logout',
      icon: <LogoutOutlined />,
      label: 'Sign out',
      onClick: handleLogout,
    },
  ];

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Sider 
        trigger={null} 
        collapsible 
        collapsed={collapsed}
        style={{
          backgroundColor: '#ffffff',
          boxShadow: '2px 0 8px rgba(0, 0, 0, 0.05)',
        }}
        width={240}
        collapsedWidth={isMobile ? 0 : 80}
      >
        {/* Logo */}
        <Link to="/" aria-label="Go to home page" style={{
          height: 64,
          display: 'flex',
          alignItems: 'center',
          justifyContent: collapsed ? 'center' : 'flex-start',
          padding: collapsed ? 0 : '0 20px',
          borderBottom: '1px solid #dedee5',
          color: 'inherit',
          textDecoration: 'none',
          cursor: 'pointer',
        }}>
          <div style={{
            width: 36,
            height: 36,
            backgroundColor: '#7132f5',
            borderRadius: 10,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}>
            <span style={{ color: '#ffffff', fontSize: 20, fontWeight: 700 }}>T</span>
          </div>
          {!collapsed && (
            <span style={{
              marginLeft: 12,
              fontSize: 16,
              fontWeight: 700,
              color: '#101114',
              letterSpacing: '-0.5px',
            }}>
              TutorMatch
            </span>
          )}
        </Link>

        {/* Menu */}
        <Menu
          mode="inline"
          selectedKeys={[getSelectedKey()]}
          onClick={handleMenuClick}
          style={{ 
            border: 'none', 
            marginTop: 8,
            backgroundColor: 'transparent',
          }}
          items={menuItems.map((item) => ({
            key: item.key,
            icon: item.icon,
            label: item.label,
          }))}
        />
      </Sider>

      <Layout>
        {/* Header */}
        <Header style={{
          backgroundColor: '#ffffff',
          padding: isMobile ? '0 12px' : '0 24px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          boxShadow: '0 2px 8px rgba(0, 0, 0, 0.05)',
          position: 'sticky',
          top: 0,
          zIndex: 100,
        }}>
          <Button
            type="text"
            icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
            onClick={() => setCollapsed(!collapsed)}
            style={{ fontSize: 16, width: 48, height: 48 }}
          />

          <div style={{ display: 'flex', alignItems: 'center', gap: isMobile ? 8 : 16 }}>
            {/* Notifications */}
            <Popover
              content={notificationContent}
              trigger="click"
              placement="bottomRight"
              arrow={{ pointAtCenter: true }}
            >
              <Badge count={unreadCount} size="small" offset={[-2, 2]}>
                <Button
                  type="text"
                  icon={<BellOutlined style={{ fontSize: 20 }} />}
                  style={{ width: 44, height: 44 }}
                />
              </Badge>
            </Popover>

            {/* User Menu */}
            <Dropdown menu={{ items: userMenuItems }} placement="bottomRight">
              <Space style={{ cursor: 'pointer' }}>
                <Avatar
                  src={user?.avatarUrl}
                  icon={<UserOutlined />}
                  style={{ backgroundColor: '#7132f5' }}
                />
                {!isMobile && <div style={{ display: 'flex', flexDirection: 'column', lineHeight: 1.3, maxWidth: 180 }}>
                  <span style={{ fontSize: 14, fontWeight: 500, color: '#101114' }}>
                    {user?.fullName}
                  </span>
                  <span style={{ fontSize: 12, color: '#686b82' }}>
                    {user?.role === 'Student' ? 'Student' : user?.role === 'Tutor' ? 'Tutor' : 'Administrator'}
                  </span>
                </div>}
              </Space>
            </Dropdown>
          </div>
        </Header>

        {/* Content */}
        <Content style={{
          margin: isMobile ? 12 : 24,
          padding: isMobile ? 16 : 24,
          backgroundColor: '#f8f9fa',
          borderRadius: 12,
          minHeight: 280,
          overflow: 'auto',
        }}>
          <Outlet />
        </Content>
      </Layout>
    </Layout>
  );
};

export default MainLayout;

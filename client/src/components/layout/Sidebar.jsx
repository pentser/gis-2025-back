import React from 'react';
import { Link } from 'react-router-dom';
import Drawer from '@mui/material/Drawer';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import MapIcon from '@mui/icons-material/Map';
import PeopleIcon from '@mui/icons-material/People';
import DashboardIcon from '@mui/icons-material/Dashboard';
import PersonIcon from '@mui/icons-material/Person';
import HomeIcon from '@mui/icons-material/Home';
import AssignmentIcon from '@mui/icons-material/Assignment';
import { useAuth } from '../../context/AuthContext';
import styles from './Layout.module.css';
import { Divider } from '@mui/material';

const Sidebar = ({ open, onClose }) => {
  const { user } = useAuth();

  const menuItems = [
    { text: 'דף הבית', icon: <HomeIcon />, path: '/' },
    { text: 'קשישים', icon: <PeopleIcon />, path: '/elderly' },
    { text: 'ביקורים', icon: <AssignmentIcon />, path: '/visits' },
  ];

  if (user?.role === 'admin') {
    menuItems.push({ text: 'לוח בקרה', icon: <DashboardIcon />, path: '/dashboard' });
  }

  return (
    <Drawer
      anchor="right"
      open={open}
      onClose={onClose}
      classes={{ paper: styles.drawer }}
    >
      <div className={styles.drawerHeader}>
        <h3>תפריט</h3>
      </div>
      
      <List>
        {menuItems.map((item) => (
          <ListItem
            button
            component={Link}
            to={item.path}
            key={item.text}
            onClick={onClose}
            className={styles.listItem}
          >
            <ListItemIcon>{item.icon}</ListItemIcon>
            <ListItemText primary={item.text} />
          </ListItem>
        ))}
      </List>
      <Divider />
    </Drawer>
  );
};

export default Sidebar; 
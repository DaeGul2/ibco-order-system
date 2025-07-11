// client/src/components/SidebarLayout.js
import {
  AppBar, Toolbar, Typography, IconButton, Menu, MenuItem,
  Drawer, List, ListItem, ListItemText, Collapse, Box
} from '@mui/material';
import { ExpandLess, ExpandMore } from '@mui/icons-material';
import AccountCircle from '@mui/icons-material/AccountCircle';
import { useState } from 'react';
import { useNavigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const SidebarLayout = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const [anchorEl, setAnchorEl] = useState(null);
  const [openIngredient, setOpenIngredient] = useState(false);
  const [openProduct, setOpenProduct] = useState(false);
  const [openOrder, setOpenOrder] = useState(false);
  const [openWarehouse, setOpenWarehouse] = useState(false);

  const handleToggle = (setOpen) => setOpen(prev => !prev);

  const handleMenu = (event) => setAnchorEl(event.currentTarget);
  const handleClose = () => setAnchorEl(null);

  const handleNav = (path) => {
    navigate(path);
  };

  return (
    <Box sx={{ display: 'flex' }}>
      {/* 사이드 Drawer */}
      <Drawer variant="permanent" sx={{
        width: 240, flexShrink: 0,
        [`& .MuiDrawer-paper`]: { width: 240, boxSizing: 'border-box' }
      }}>
        <Toolbar />
        <List>
          {/* 원료 */}
          <ListItem button onClick={() => handleToggle(setOpenIngredient)}>
            <ListItemText primary="원료" />
            {openIngredient ? <ExpandLess /> : <ExpandMore />}
          </ListItem>
          <Collapse in={openIngredient} timeout="auto" unmountOnExit>
            <List component="div" disablePadding>
              <ListItem button sx={{ pl: 4 }} onClick={() => handleNav('/ingredients/list')}>
                <ListItemText primary="저장된 원료보기" />
              </ListItem>
            </List>
          </Collapse>

          {/* 제품 */}
          <ListItem button onClick={() => handleToggle(setOpenProduct)}>
            <ListItemText primary="상품" />
            {openProduct ? <ExpandLess /> : <ExpandMore />}
          </ListItem>
          <Collapse in={openProduct} timeout="auto" unmountOnExit>
            <List component="div" disablePadding>
              <ListItem button sx={{ pl: 4 }} onClick={() => handleNav('/products/list')}>
                <ListItemText primary="상품관리" />
              </ListItem>
            </List>
          </Collapse>

          {/* 발주 */}
          <ListItem button onClick={() => handleToggle(setOpenOrder)}>
            <ListItemText primary="발주" />
            {openOrder ? <ExpandLess /> : <ExpandMore />}
          </ListItem>
          <Collapse in={openOrder} timeout="auto" unmountOnExit>
            <List component="div" disablePadding>
              <ListItem button sx={{ pl: 4 }} onClick={() => handleNav('/orders/list')}>
                <ListItemText primary="발주관리" />
              </ListItem>
            </List>
          </Collapse>

          <ListItem button onClick={() => handleToggle(setOpenWarehouse)}>
            <ListItemText primary="창고" />
            {openWarehouse ? <ExpandLess /> : <ExpandMore />}
          </ListItem>
          <Collapse in={openWarehouse} timeout="auto" unmountOnExit>
            <List component="div" disablePadding>
              <ListItem button sx={{ pl: 4 }} onClick={() => handleNav('/warehouses/manage')}>
                <ListItemText primary="창고관리" />
              </ListItem>
              <ListItem button sx={{ pl: 4 }} onClick={() => handleNav('/warehouses/ingredients')}> {/* ✅ 추가 */}
                <ListItemText primary="창고 원료 관리" />
              </ListItem>
            </List>
          </Collapse>
        </List>
      </Drawer>

      {/* 메인 영역 */}
      <Box sx={{ flexGrow: 1 }}>
        <AppBar position="static" sx={{ ml: 0 }}>
          <Toolbar>
            <Typography variant="h6" sx={{ flexGrow: 1 }}>
              IBCO 주문 시스템
            </Typography>
            {user && (
              <Box>
                <IconButton onClick={handleMenu} color="inherit">
                  <AccountCircle />
                </IconButton>
                <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={handleClose}>
                  <MenuItem disabled>{user.userName}님</MenuItem>
                  <MenuItem onClick={() => { logout(); handleClose(); }}>로그아웃</MenuItem>
                </Menu>
              </Box>
            )}
          </Toolbar>
        </AppBar>
        <Box sx={{ p: 3 }}>
          <Outlet />
        </Box>
      </Box>
    </Box>
  );
};

export default SidebarLayout;

import React from 'react';
import {
  Drawer,
  Typography,
  Box,
  IconButton,
  Divider,
  List,
  ListItem,
  ListItemText
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';

const ElderlyDetailsSidebar = ({ elderly, open, onClose, lastVisit }) => {
  if (!elderly) return null;

  const formatDate = (dateString) => {
    if (!dateString) return 'לא צוין';
    return new Date(dateString).toLocaleDateString('he-IL');
  };

  const detailsList = [
    { label: 'שם פרטי', value: elderly.firstName },
    { label: 'שם משפחה', value: elderly.lastName },
    { label: 'תאריך לידה', value: formatDate(elderly.birthDate) },
    { label: 'טלפון', value: elderly.phone },
    { label: 'כתובת', value: elderly.address },
    { label: 'שם איש קשר לחירום', value: elderly.emergencyContact?.name },
    { label: 'טלפון איש קשר לחירום', value: elderly.emergencyContact?.phone },
    { label: 'בריאות', value: elderly.conditions?.join(', ') || 'אין מידע' },
    { label: 'הערות', value: elderly.notes || 'אין הערות' },
    { label: 'ימים מועדפים', value: elderly.preferredDays?.join(', ') || 'לא צוין' },
    { label: 'שעות מועדפות', value: elderly.preferredHours || 'לא צוין' },
    { label: 'ביקור אחרון', value: formatDate(lastVisit?.date) },
    { label: 'הערות מביקור אחרון', value: lastVisit?.notes || 'אין הערות' }
  ];

  return (
    <Drawer
      anchor="right"
      open={open}
      onClose={onClose}
      PaperProps={{
        sx: {
          width: 400,
          p: 3,
          direction: 'rtl'
        }
      }}
    >
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
        <Typography variant="h6" component="h2">
          פרטי קשיש
        </Typography>
        <IconButton onClick={onClose} size="large">
          <CloseIcon />
        </IconButton>
      </Box>

      <Divider />

      <List>
        {detailsList.map((item, index) => (
          <React.Fragment key={item.label}>
            <ListItem>
              <ListItemText
                primary={item.label}
                secondary={item.value}
                primaryTypographyProps={{
                  fontWeight: 'bold',
                  color: 'primary'
                }}
                secondaryTypographyProps={{
                  style: { whiteSpace: 'pre-wrap' }
                }}
              />
            </ListItem>
            {index < detailsList.length - 1 && <Divider />}
          </React.Fragment>
        ))}
      </List>
    </Drawer>
  );
};

export default ElderlyDetailsSidebar; 
import React from 'react';
import { Container, Typography, Grid, Paper, Box, Avatar } from '@mui/material';
import CodeIcon from '@mui/icons-material/Code';
import StorageIcon from '@mui/icons-material/Storage';
import MapIcon from '@mui/icons-material/Map';
import styles from './About.module.css';

const About = () => {
  const teamMembers = [
    {
      role: 'יובל הוכברג Front-End',
      specialties: ['React', 'JavaScript', 'HTML/CSS', 'Leaflet/OpenLayers'],
      responsibilities: 'פיתוח ממשק המשתמש, אינטגרציה של מפות, UX/UI',
      icon: <CodeIcon sx={{ fontSize: 40 }} />
    },
    {
      role: 'איציק בארון Back-End',
      specialties: ['Node.js', 'Express', 'MongoDB', 'ניהול API'],
      responsibilities: 'פיתוח השרת, תכנון וניהול בסיס הנתונים, אבטחת מידע',
      icon: <StorageIcon sx={{ fontSize: 40 }} />
    },
    {
      role: 'אלי פנצר GIS ואינטגרציה',
      specialties: ['GeoJSON', 'מערכות GIS', 'אינטגרציה', 'DevOps'],
      responsibilities: 'ניהול מערכות GIS, אינטגרציה ותשתיות',
      icon: <MapIcon sx={{ fontSize: 40 }} />
    }
  ];

  return (
    <Container maxWidth="lg" sx={{ py: 8 }}>
      <Typography 
        variant="h2" 
        component="h1" 
        align="center" 
        gutterBottom
        sx={{ 
          mb: 6,
          fontWeight: 'bold',
          color: '#1a237e'
        }}
      >
        הצוות שלנו
      </Typography>

      <Grid container spacing={4} justifyContent="center">
        {teamMembers.map((member, index) => (
          <Grid item xs={12} md={4} key={index}>
            <Paper 
              elevation={3}
              sx={{
                p: 4,
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                transition: 'transform 0.2s',
                '&:hover': {
                  transform: 'translateY(-5px)'
                }
              }}
            >
              <Avatar 
                sx={{ 
                  width: 80, 
                  height: 80, 
                  bgcolor: '#1a237e',
                  mb: 2
                }}
              >
                {member.icon}
              </Avatar>

              <Typography 
                variant="h5" 
                component="h2" 
                align="center"
                sx={{ 
                  mb: 2,
                  fontWeight: 'bold',
                  color: '#1a237e'
                }}
              >
                {member.role}
              </Typography>

              <Box sx={{ mb: 2 }}>
                <Typography 
                  variant="h6" 
                  component="h3"
                  align="center"
                  sx={{ mb: 1, color: '#303f9f' }}
                >
                  התמחויות
                </Typography>
                <Box 
                  sx={{ 
                    display: 'flex', 
                    flexWrap: 'wrap', 
                    justifyContent: 'center',
                    gap: 1
                  }}
                >
                  {member.specialties.map((specialty, idx) => (
                    <Typography 
                      key={idx}
                      sx={{
                        bgcolor: '#e8eaf6',
                        px: 1.5,
                        py: 0.5,
                        borderRadius: 2,
                        fontSize: '0.9rem'
                      }}
                    >
                      {specialty}
                    </Typography>
                  ))}
                </Box>
              </Box>

              <Typography 
                variant="h6" 
                component="h3"
                align="center"
                sx={{ mb: 1, color: '#303f9f' }}
              >
                תחומי אחריות
              </Typography>
              <Typography 
                align="center"
                sx={{ color: '#455a64' }}
              >
                {member.responsibilities}
              </Typography>
            </Paper>
          </Grid>
        ))}
      </Grid>
    </Container>
  );
};

export default About; 
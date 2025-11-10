import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Container,
  Box,
  Typography,
  Button,
  AppBar,
  Toolbar,
  Tabs,
  Tab,
  Grid,
  Card,
  CardContent,
  CardActions,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Chip,
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import AddIcon from '@mui/icons-material/Add';
import {
  characterAPI,
  locationAPI,
  loreAPI,
  plotAPI,
  Character,
  Location,
  LoreEntry,
  PlotPoint,
} from '../services/storyBibleService';

const StoryBiblePage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [tab, setTab] = useState(0);
  const [characters, setCharacters] = useState<Character[]>([]);
  const [locations, setLocations] = useState<Location[]>([]);
  const [lore, setLore] = useState<LoreEntry[]>([]);
  const [plotPoints, setPlotPoints] = useState<PlotPoint[]>([]);
  const [openDialog, setOpenDialog] = useState(false);
  const [dialogType, setDialogType] = useState<'character' | 'location' | 'lore' | 'plot'>('character');

  useEffect(() => {
    if (id) {
      loadAll(id);
    }
  }, [id]);

  const loadAll = async (projectId: string) => {
    try {
      const [charRes, locRes, loreRes, plotRes] = await Promise.all([
        characterAPI.list(projectId),
        locationAPI.list(projectId),
        loreAPI.list(projectId),
        plotAPI.list(projectId),
      ]);
      setCharacters(charRes.data);
      setLocations(locRes.data);
      setLore(loreRes.data);
      setPlotPoints(plotRes.data);
    } catch (error) {
      console.error('Failed to load Story Bible:', error);
    }
  };

  const handleOpenDialog = (type: 'character' | 'location' | 'lore' | 'plot') => {
    setDialogType(type);
    setOpenDialog(true);
  };

  // Placeholder handlers for future implementation
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const handleCreateCharacter = async (data: Partial<Character>) => {
    if (!id) return;
    try {
      const response = await characterAPI.create(id, data);
      setCharacters([...characters, response.data]);
      setOpenDialog(false);
    } catch (error) {
      console.error('Failed to create character:', error);
    }
  };

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const handleCreateLocation = async (data: Partial<Location>) => {
    if (!id) return;
    try {
      const response = await locationAPI.create(id, data);
      setLocations([...locations, response.data]);
      setOpenDialog(false);
    } catch (error) {
      console.error('Failed to create location:', error);
    }
  };

  return (
    <Box>
      <AppBar position="static" color="default">
        <Toolbar>
          <Button
            startIcon={<ArrowBackIcon />}
            onClick={() => navigate(`/project/${id}`)}
            sx={{ mr: 2 }}
          >
            Back
          </Button>
          <Typography variant="h6" sx={{ flexGrow: 1 }}>
            Story Bible
          </Typography>
        </Toolbar>
      </AppBar>

      <Container maxWidth="xl">
        <Box sx={{ py: 2 }}>
          <Tabs value={tab} onChange={(e, v) => setTab(v)}>
            <Tab label="Characters" />
            <Tab label="Locations" />
            <Tab label="Lore" />
            <Tab label="Plot" />
          </Tabs>

          {/* Characters Tab */}
          {tab === 0 && (
            <Box sx={{ mt: 3 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
                <Typography variant="h5">Characters</Typography>
                <Button
                  startIcon={<AddIcon />}
                  variant="contained"
                  onClick={() => handleOpenDialog('character')}
                >
                  Add Character
                </Button>
              </Box>
              <Grid container spacing={2}>
                {characters.map((char) => (
                  <Grid item xs={12} md={6} lg={4} key={char.id}>
                    <Card>
                      <CardContent>
                        <Typography variant="h6">{char.name}</Typography>
                        <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                          {char.description}
                        </Typography>
                        {char.traits.length > 0 && (
                          <Box sx={{ mt: 2, display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                            {char.traits.map((trait, i) => (
                              <Chip key={i} label={trait} size="small" />
                            ))}
                          </Box>
                        )}
                      </CardContent>
                      <CardActions>
                        <Button size="small">Edit</Button>
                        <Button size="small">View</Button>
                      </CardActions>
                    </Card>
                  </Grid>
                ))}
              </Grid>
              {characters.length === 0 && (
                <Typography color="text.secondary" sx={{ textAlign: 'center', mt: 4 }}>
                  No characters yet. Add your first character to start building your story world.
                </Typography>
              )}
            </Box>
          )}

          {/* Locations Tab */}
          {tab === 1 && (
            <Box sx={{ mt: 3 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
                <Typography variant="h5">Locations</Typography>
                <Button
                  startIcon={<AddIcon />}
                  variant="contained"
                  onClick={() => handleOpenDialog('location')}
                >
                  Add Location
                </Button>
              </Box>
              <Grid container spacing={2}>
                {locations.map((loc) => (
                  <Grid item xs={12} md={6} lg={4} key={loc.id}>
                    <Card>
                      <CardContent>
                        <Typography variant="h6">{loc.name}</Typography>
                        <Typography variant="caption" color="text.secondary">
                          {loc.type}
                        </Typography>
                        <Typography variant="body2" sx={{ mt: 1 }}>
                          {loc.description}
                        </Typography>
                      </CardContent>
                      <CardActions>
                        <Button size="small">Edit</Button>
                        <Button size="small">View</Button>
                      </CardActions>
                    </Card>
                  </Grid>
                ))}
              </Grid>
              {locations.length === 0 && (
                <Typography color="text.secondary" sx={{ textAlign: 'center', mt: 4 }}>
                  No locations yet. Add locations where your story takes place.
                </Typography>
              )}
            </Box>
          )}

          {/* Lore Tab */}
          {tab === 2 && (
            <Box sx={{ mt: 3 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
                <Typography variant="h5">Lore & Worldbuilding</Typography>
                <Button
                  startIcon={<AddIcon />}
                  variant="contained"
                  onClick={() => handleOpenDialog('lore')}
                >
                  Add Lore Entry
                </Button>
              </Box>
              <Grid container spacing={2}>
                {lore.map((entry) => (
                  <Grid item xs={12} md={6} key={entry.id}>
                    <Card>
                      <CardContent>
                        <Typography variant="h6">{entry.title}</Typography>
                        <Typography variant="caption" color="text.secondary">
                          {entry.category}
                        </Typography>
                        <Typography variant="body2" sx={{ mt: 1 }}>
                          {entry.content.substring(0, 200)}
                          {entry.content.length > 200 && '...'}
                        </Typography>
                      </CardContent>
                      <CardActions>
                        <Button size="small">Edit</Button>
                        <Button size="small">View</Button>
                      </CardActions>
                    </Card>
                  </Grid>
                ))}
              </Grid>
              {lore.length === 0 && (
                <Typography color="text.secondary" sx={{ textAlign: 'center', mt: 4 }}>
                  No lore entries yet. Document your world's history, magic systems, and more.
                </Typography>
              )}
            </Box>
          )}

          {/* Plot Tab */}
          {tab === 3 && (
            <Box sx={{ mt: 3 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
                <Typography variant="h5">Plot Points</Typography>
                <Button
                  startIcon={<AddIcon />}
                  variant="contained"
                  onClick={() => handleOpenDialog('plot')}
                >
                  Add Plot Point
                </Button>
              </Box>
              <Grid container spacing={2}>
                {plotPoints.map((point) => (
                  <Grid item xs={12} md={6} key={point.id}>
                    <Card>
                      <CardContent>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                          <Typography variant="h6">{point.title}</Typography>
                          <Chip label={`Act ${point.act}`} size="small" />
                        </Box>
                        <Typography variant="body2" sx={{ mt: 1 }}>
                          {point.description}
                        </Typography>
                        <Chip
                          label={point.status}
                          size="small"
                          sx={{ mt: 2 }}
                          color={
                            point.status === 'completed'
                              ? 'success'
                              : point.status === 'in_progress'
                              ? 'primary'
                              : 'default'
                          }
                        />
                      </CardContent>
                      <CardActions>
                        <Button size="small">Edit</Button>
                      </CardActions>
                    </Card>
                  </Grid>
                ))}
              </Grid>
              {plotPoints.length === 0 && (
                <Typography color="text.secondary" sx={{ textAlign: 'center', mt: 4 }}>
                  No plot points yet. Plan your story structure and key events.
                </Typography>
              )}
            </Box>
          )}
        </Box>
      </Container>

      {/* Add Dialog (simplified) */}
      <Dialog open={openDialog} onClose={() => setOpenDialog(false)} maxWidth="md" fullWidth>
        <DialogTitle>Add {dialogType}</DialogTitle>
        <DialogContent>
          <Typography>Dialog form for adding {dialogType} would go here.</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)}>Cancel</Button>
          <Button variant="contained">Create</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default StoryBiblePage;
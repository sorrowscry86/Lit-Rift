import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import {
  Box,
  Container,
  Paper,
  Tabs,
  Tab,
  Typography,
  CircularProgress,
  Alert
} from '@mui/material';
import ViewModuleIcon from '@mui/icons-material/ViewModule';
import GridOnIcon from '@mui/icons-material/GridOn';
import ListAltIcon from '@mui/icons-material/ListAlt';
import { Corkboard } from '../components/Planning/Corkboard';
import { MatrixGrid } from '../components/Planning/MatrixGrid';
import { OutlineView } from '../components/Planning/OutlineView';
import {
  getCorkboard,
  saveCorkboard,
  addCorkboardItem,
  updateCorkboardItem,
  deleteCorkboardItem,
  getMatrix,
  generateMatrix,
  updateMatrixCell,
  getOutline,
  generateOutline,
  updateOutline,
  exportOutlineToMarkdown,
  CorkboardItem,
  MatrixStructure,
  OutlineNode
} from '../services/visualPlanningService';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`planning-tabpanel-${index}`}
      aria-labelledby={`planning-tab-${index}`}
      {...other}
      style={{ height: '100%' }}
    >
      {value === index && <Box sx={{ height: '100%' }}>{children}</Box>}
    </div>
  );
}

export const VisualPlanningPage: React.FC = () => {
  const { projectId } = useParams<{ projectId: string }>();
  const [activeTab, setActiveTab] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Corkboard state
  const [corkboardItems, setCorkboardItems] = useState<CorkboardItem[]>([]);

  // Matrix state
  const [matrix, setMatrix] = useState<MatrixStructure | null>(null);

  // Outline state
  const [outline, setOutline] = useState<OutlineNode[]>([]);

  useEffect(() => {
    if (projectId) {
      loadData();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [projectId]);

  const loadData = async () => {
    if (!projectId) return;

    setLoading(true);
    setError(null);

    try {
      // Load all planning data
      const [corkboardData, matrixData, outlineData] = await Promise.allSettled([
        getCorkboard(projectId),
        getMatrix(projectId),
        getOutline(projectId)
      ]);

      // Corkboard
      if (corkboardData.status === 'fulfilled') {
        setCorkboardItems(corkboardData.value.items || []);
      }

      // Matrix
      if (matrixData.status === 'fulfilled') {
        setMatrix(matrixData.value);
      }

      // Outline
      if (outlineData.status === 'fulfilled') {
        setOutline(outlineData.value || []);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to load planning data');
    } finally {
      setLoading(false);
    }
  };

  // Corkboard handlers
  const handleCorkboardChange = async (items: CorkboardItem[]) => {
    if (!projectId) return;
    setCorkboardItems(items);
    try {
      await saveCorkboard(projectId, items);
    } catch (err: any) {
      setError(err.message || 'Failed to save corkboard');
    }
  };

  const handleAddCorkboardItem = async (item: Omit<CorkboardItem, 'id'>) => {
    if (!projectId) return;
    try {
      const newItem = await addCorkboardItem(projectId, item);
      setCorkboardItems([...corkboardItems, newItem]);
    } catch (err: any) {
      setError(err.message || 'Failed to add item');
    }
  };

  const handleUpdateCorkboardItem = async (itemId: string, updates: Partial<CorkboardItem>) => {
    if (!projectId) return;
    try {
      await updateCorkboardItem(projectId, itemId, updates);
      setCorkboardItems(
        corkboardItems.map(item => (item.id === itemId ? { ...item, ...updates } : item))
      );
    } catch (err: any) {
      setError(err.message || 'Failed to update item');
    }
  };

  const handleDeleteCorkboardItem = async (itemId: string) => {
    if (!projectId) return;
    try {
      await deleteCorkboardItem(projectId, itemId);
      setCorkboardItems(corkboardItems.filter(item => item.id !== itemId));
    } catch (err: any) {
      setError(err.message || 'Failed to delete item');
    }
  };

  // Matrix handlers
  const handleMatrixChange = (newMatrix: MatrixStructure) => {
    setMatrix(newMatrix);
  };

  const handleGenerateMatrix = async () => {
    if (!projectId) return;
    try {
      const generated = await generateMatrix(projectId);
      setMatrix(generated);
    } catch (err: any) {
      setError(err.message || 'Failed to generate matrix');
    }
  };

  const handleUpdateMatrixCell = async (row: number, col: number, content: string) => {
    if (!projectId) return;
    try {
      await updateMatrixCell(projectId, row, col, content);
    } catch (err: any) {
      setError(err.message || 'Failed to update cell');
    }
  };

  // Outline handlers
  const handleOutlineChange = async (newOutline: OutlineNode[]) => {
    if (!projectId) return;
    setOutline(newOutline);
    try {
      await updateOutline(projectId, newOutline);
    } catch (err: any) {
      setError(err.message || 'Failed to update outline');
    }
  };

  const handleGenerateOutline = async () => {
    if (!projectId) return;
    try {
      const generated = await generateOutline(projectId);
      setOutline(generated);
    } catch (err: any) {
      setError(err.message || 'Failed to generate outline');
    }
  };

  const handleExportMarkdown = async (): Promise<string> => {
    if (!projectId) return '';
    try {
      return await exportOutlineToMarkdown(projectId);
    } catch (err: any) {
      setError(err.message || 'Failed to export outline');
      return '';
    }
  };

  if (loading) {
    return (
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          height: '100vh'
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Container maxWidth={false} sx={{ height: '100vh', display: 'flex', flexDirection: 'column', p: 2 }}>
      {/* Header */}
      <Box sx={{ mb: 2 }}>
        <Typography variant="h4" gutterBottom>
          Visual Planning
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Plan and structure your story with multiple visualization tools
        </Typography>
      </Box>

      {/* Error Alert */}
      {error && (
        <Alert severity="error" onClose={() => setError(null)} sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {/* Tabs */}
      <Paper sx={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        <Tabs
          value={activeTab}
          onChange={(_, newValue) => setActiveTab(newValue)}
          sx={{ borderBottom: 1, borderColor: 'divider' }}
        >
          <Tab
            icon={<ViewModuleIcon />}
            label="Corkboard"
            iconPosition="start"
            id="planning-tab-0"
            aria-controls="planning-tabpanel-0"
          />
          <Tab
            icon={<GridOnIcon />}
            label="Matrix"
            iconPosition="start"
            id="planning-tab-1"
            aria-controls="planning-tabpanel-1"
          />
          <Tab
            icon={<ListAltIcon />}
            label="Outline"
            iconPosition="start"
            id="planning-tab-2"
            aria-controls="planning-tabpanel-2"
          />
        </Tabs>

        {/* Tab Panels */}
        <Box sx={{ flex: 1, overflow: 'hidden' }}>
          <TabPanel value={activeTab} index={0}>
            <Corkboard
              projectId={projectId!}
              items={corkboardItems}
              onItemsChange={handleCorkboardChange}
              onAddItem={handleAddCorkboardItem}
              onUpdateItem={handleUpdateCorkboardItem}
              onDeleteItem={handleDeleteCorkboardItem}
            />
          </TabPanel>

          <TabPanel value={activeTab} index={1}>
            <MatrixGrid
              projectId={projectId!}
              matrix={matrix}
              onMatrixChange={handleMatrixChange}
              onGenerate={handleGenerateMatrix}
              onUpdateCell={handleUpdateMatrixCell}
            />
          </TabPanel>

          <TabPanel value={activeTab} index={2}>
            <OutlineView
              projectId={projectId!}
              outline={outline}
              onOutlineChange={handleOutlineChange}
              onGenerate={handleGenerateOutline}
              onExportMarkdown={handleExportMarkdown}
            />
          </TabPanel>
        </Box>
      </Paper>
    </Container>
  );
};

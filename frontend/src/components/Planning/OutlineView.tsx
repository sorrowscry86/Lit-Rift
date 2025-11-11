import React, { useState } from 'react';
import {
  Box,
  Paper,
  Typography,
  IconButton,
  Button,
  TextField,
  Collapse,
  Tooltip,
  Alert
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import AutoFixHighIcon from '@mui/icons-material/AutoFixHigh';
import DownloadIcon from '@mui/icons-material/Download';
import { OutlineNode } from '../../services/visualPlanningService';

interface OutlineViewProps {
  projectId: string;
  outline: OutlineNode[];
  onOutlineChange: (outline: OutlineNode[]) => void;
  onGenerate: () => Promise<void>;
  onExportMarkdown: () => Promise<string>;
}

interface OutlineItemProps {
  node: OutlineNode;
  level: number;
  onUpdate: (id: string, updates: Partial<OutlineNode>) => void;
  onDelete: (id: string) => void;
  onAddChild: (parentId: string) => void;
}

const OutlineItem: React.FC<OutlineItemProps> = ({
  node,
  level,
  onUpdate,
  onDelete,
  onAddChild
}) => {
  const [expanded, setExpanded] = useState(true);
  const [editing, setEditing] = useState(false);
  const [title, setTitle] = useState(node.title);
  const [content, setContent] = useState(node.content);

  const hasChildren = node.children && node.children.length > 0;

  const handleSave = () => {
    onUpdate(node.id, { title, content });
    setEditing(false);
  };

  const handleCancel = () => {
    setTitle(node.title);
    setContent(node.content);
    setEditing(false);
  };

  const indent = level * 32;

  return (
    <Box>
      <Paper
        sx={{
          p: 2,
          mb: 1,
          ml: `${indent}px`,
          backgroundColor: level === 0 ? 'primary.dark' : level === 1 ? 'primary.main' : 'background.paper',
          color: level <= 1 ? 'primary.contrastText' : 'text.primary'
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1 }}>
          {/* Expand/Collapse */}
          {hasChildren && (
            <IconButton
              size="small"
              onClick={() => setExpanded(!expanded)}
              sx={{ color: level <= 1 ? 'inherit' : 'text.secondary' }}
            >
              {expanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}
            </IconButton>
          )}

          {/* Content */}
          <Box sx={{ flex: 1 }}>
            {editing ? (
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                <TextField
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  size="small"
                  fullWidth
                  placeholder="Title"
                  sx={{ backgroundColor: 'background.paper' }}
                />
                <TextField
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  size="small"
                  fullWidth
                  multiline
                  rows={2}
                  placeholder="Content"
                  sx={{ backgroundColor: 'background.paper' }}
                />
                <Box sx={{ display: 'flex', gap: 1 }}>
                  <Button size="small" onClick={handleCancel}>
                    Cancel
                  </Button>
                  <Button size="small" variant="contained" onClick={handleSave}>
                    Save
                  </Button>
                </Box>
              </Box>
            ) : (
              <>
                <Typography
                  variant={level === 0 ? 'h6' : level === 1 ? 'subtitle1' : 'body1'}
                  sx={{ fontWeight: level <= 1 ? 'bold' : 'normal' }}
                >
                  {node.title}
                </Typography>
                {node.content && (
                  <Typography
                    variant="body2"
                    sx={{
                      mt: 0.5,
                      opacity: 0.9,
                      whiteSpace: 'pre-wrap'
                    }}
                  >
                    {node.content}
                  </Typography>
                )}
              </>
            )}
          </Box>

          {/* Actions */}
          {!editing && (
            <Box sx={{ display: 'flex', gap: 0.5 }}>
              <Tooltip title="Add child">
                <IconButton
                  size="small"
                  onClick={() => onAddChild(node.id)}
                  sx={{ color: level <= 1 ? 'inherit' : 'text.secondary' }}
                >
                  <AddIcon fontSize="small" />
                </IconButton>
              </Tooltip>
              <Tooltip title="Edit">
                <IconButton
                  size="small"
                  onClick={() => setEditing(true)}
                  sx={{ color: level <= 1 ? 'inherit' : 'text.secondary' }}
                >
                  <EditIcon fontSize="small" />
                </IconButton>
              </Tooltip>
              <Tooltip title="Delete">
                <IconButton
                  size="small"
                  onClick={() => onDelete(node.id)}
                  sx={{ color: level <= 1 ? 'inherit' : 'text.secondary' }}
                >
                  <DeleteIcon fontSize="small" />
                </IconButton>
              </Tooltip>
            </Box>
          )}
        </Box>
      </Paper>

      {/* Children */}
      {hasChildren && (
        <Collapse in={expanded}>
          <Box>
            {node.children!.map((child) => (
              <OutlineItem
                key={child.id}
                node={child}
                level={level + 1}
                onUpdate={onUpdate}
                onDelete={onDelete}
                onAddChild={onAddChild}
              />
            ))}
          </Box>
        </Collapse>
      )}
    </Box>
  );
};

export const OutlineView: React.FC<OutlineViewProps> = ({
  projectId,
  outline,
  onOutlineChange,
  onGenerate,
  onExportMarkdown
}) => {
  const [localOutline, setLocalOutline] = useState<OutlineNode[]>(outline);
  const [generating, setGenerating] = useState(false);

  const updateNode = (id: string, updates: Partial<OutlineNode>) => {
    const updateNodeRecursive = (nodes: OutlineNode[]): OutlineNode[] => {
      return nodes.map(node => {
        if (node.id === id) {
          return { ...node, ...updates };
        }
        if (node.children) {
          return { ...node, children: updateNodeRecursive(node.children) };
        }
        return node;
      });
    };

    const updated = updateNodeRecursive(localOutline);
    setLocalOutline(updated);
    onOutlineChange(updated);
  };

  const deleteNode = (id: string) => {
    const deleteNodeRecursive = (nodes: OutlineNode[]): OutlineNode[] => {
      return nodes
        .filter(node => node.id !== id)
        .map(node => {
          if (node.children) {
            return { ...node, children: deleteNodeRecursive(node.children) };
          }
          return node;
        });
    };

    const updated = deleteNodeRecursive(localOutline);
    setLocalOutline(updated);
    onOutlineChange(updated);
  };

  const addChild = (parentId: string) => {
    const addChildRecursive = (nodes: OutlineNode[]): OutlineNode[] => {
      return nodes.map(node => {
        if (node.id === parentId) {
          const newChild: OutlineNode = {
            id: `node-${Date.now()}`,
            title: 'New Section',
            content: '',
            level: node.level + 1,
            children: []
          };
          return {
            ...node,
            children: [...(node.children || []), newChild]
          };
        }
        if (node.children) {
          return { ...node, children: addChildRecursive(node.children) };
        }
        return node;
      });
    };

    const updated = addChildRecursive(localOutline);
    setLocalOutline(updated);
    onOutlineChange(updated);
  };

  const addRootNode = () => {
    const newNode: OutlineNode = {
      id: `node-${Date.now()}`,
      title: 'New Chapter',
      content: '',
      level: 0,
      children: []
    };
    const updated = [...localOutline, newNode];
    setLocalOutline(updated);
    onOutlineChange(updated);
  };

  const handleGenerate = async () => {
    setGenerating(true);
    try {
      await onGenerate();
    } finally {
      setGenerating(false);
    }
  };

  const handleExport = async () => {
    const markdown = await onExportMarkdown();
    const blob = new Blob([markdown], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `outline-${projectId}.md`;
    a.click();
    URL.revokeObjectURL(url);
  };

  if (localOutline.length === 0) {
    return (
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          height: '100%',
          gap: 2,
          p: 4
        }}
      >
        <Typography variant="h6" color="text.secondary">
          No Outline Yet
        </Typography>
        <Box sx={{ display: 'flex', gap: 2 }}>
          <Button
            variant="outlined"
            startIcon={<AddIcon />}
            onClick={addRootNode}
          >
            Create Manually
          </Button>
          <Button
            variant="contained"
            startIcon={<AutoFixHighIcon />}
            onClick={handleGenerate}
            disabled={generating}
          >
            {generating ? 'Generating...' : 'Auto-Generate from Plot'}
          </Button>
        </Box>
        <Typography variant="body2" color="text.secondary" sx={{ maxWidth: 500, textAlign: 'center' }}>
          Create a hierarchical outline for your story. Auto-generate from your plot points or build it manually.
        </Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ width: '100%', height: '100%', overflow: 'auto', p: 2 }}>
      {/* Header */}
      <Box sx={{ mb: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h6">Story Outline</Typography>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Button
            size="small"
            startIcon={<AddIcon />}
            onClick={addRootNode}
          >
            Add Chapter
          </Button>
          <Button
            size="small"
            startIcon={<AutoFixHighIcon />}
            onClick={handleGenerate}
            disabled={generating}
          >
            Regenerate
          </Button>
          <Button
            size="small"
            startIcon={<DownloadIcon />}
            onClick={handleExport}
          >
            Export MD
          </Button>
        </Box>
      </Box>

      <Alert severity="info" sx={{ mb: 2 }}>
        <Typography variant="body2">
          Organize your story in a hierarchical structure. Click the + icon to add sub-sections to any node.
        </Typography>
      </Alert>

      {/* Outline Tree */}
      <Box>
        {localOutline.map((node) => (
          <OutlineItem
            key={node.id}
            node={node}
            level={0}
            onUpdate={updateNode}
            onDelete={deleteNode}
            onAddChild={addChild}
          />
        ))}
      </Box>
    </Box>
  );
};

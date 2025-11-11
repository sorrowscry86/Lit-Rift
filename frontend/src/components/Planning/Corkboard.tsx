import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  IconButton,
  TextField,
  Button,
  Typography,
  MenuItem,
  Tooltip,
  Fab,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  Select
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import { DragDropContext, Draggable, Droppable, DropResult } from 'react-beautiful-dnd';
import { CorkboardItem } from '../../services/visualPlanningService';

interface CorkboardProps {
  projectId: string;
  items: CorkboardItem[];
  onItemsChange: (items: CorkboardItem[]) => void;
  onAddItem: (item: Omit<CorkboardItem, 'id'>) => Promise<void>;
  onUpdateItem: (itemId: string, updates: Partial<CorkboardItem>) => Promise<void>;
  onDeleteItem: (itemId: string) => Promise<void>;
}

interface NewItemData {
  type: 'note' | 'scene' | 'character' | 'plot_point';
  title: string;
  content: string;
  color: string;
}

const ITEM_COLORS = [
  '#FFE6CC', // Peach
  '#FFF4CC', // Yellow
  '#E6F4CC', // Light green
  '#CCF0FF', // Light blue
  '#F0CCFF', // Lavender
  '#FFCCF0', // Pink
];

const ITEM_TYPE_LABELS = {
  note: 'Note',
  scene: 'Scene',
  character: 'Character',
  plot_point: 'Plot Point'
};

export const Corkboard: React.FC<CorkboardProps> = ({
  projectId,
  items,
  onItemsChange,
  onAddItem,
  onUpdateItem,
  onDeleteItem
}) => {
  const [localItems, setLocalItems] = useState<CorkboardItem[]>(items);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<CorkboardItem | null>(null);
  const [newItem, setNewItem] = useState<NewItemData>({
    type: 'note',
    title: '',
    content: '',
    color: ITEM_COLORS[0]
  });

  useEffect(() => {
    setLocalItems(items);
  }, [items]);

  const handleDragEnd = async (result: DropResult) => {
    if (!result.destination) return;

    const itemsCopy = Array.from(localItems);
    const [reorderedItem] = itemsCopy.splice(result.source.index, 1);
    itemsCopy.splice(result.destination.index, 0, reorderedItem);

    // Update positions based on new order
    const updatedItems = itemsCopy.map((item, index) => ({
      ...item,
      position: {
        x: (index % 5) * 220 + 20,
        y: Math.floor(index / 5) * 220 + 20
      }
    }));

    setLocalItems(updatedItems);
    onItemsChange(updatedItems);

    // Update each item's position on the backend
    for (const item of updatedItems) {
      await onUpdateItem(item.id, { position: item.position });
    }
  };

  const handleAddItem = async () => {
    const itemToAdd = {
      ...newItem,
      position: {
        x: (localItems.length % 5) * 220 + 20,
        y: Math.floor(localItems.length / 5) * 220 + 20
      }
    };

    await onAddItem(itemToAdd);
    setDialogOpen(false);
    setNewItem({
      type: 'note',
      title: '',
      content: '',
      color: ITEM_COLORS[0]
    });
  };

  const handleEditItem = (item: CorkboardItem) => {
    setEditingItem(item);
    setNewItem({
      type: item.type,
      title: item.title,
      content: item.content,
      color: item.color || ITEM_COLORS[0]
    });
    setDialogOpen(true);
  };

  const handleUpdateItem = async () => {
    if (!editingItem) return;

    await onUpdateItem(editingItem.id, {
      type: newItem.type,
      title: newItem.title,
      content: newItem.content,
      color: newItem.color
    });

    setDialogOpen(false);
    setEditingItem(null);
    setNewItem({
      type: 'note',
      title: '',
      content: '',
      color: ITEM_COLORS[0]
    });
  };

  const handleDeleteItem = async (itemId: string) => {
    await onDeleteItem(itemId);
  };

  return (
    <Box sx={{ width: '100%', height: '100%', position: 'relative', overflow: 'auto' }}>
      {/* Corkboard Background */}
      <Box
        sx={{
          minHeight: '100%',
          background: 'linear-gradient(to bottom, #8B7355 0%, #A0826D 100%)',
          padding: 2,
          minWidth: 1200
        }}
      >
        <DragDropContext onDragEnd={handleDragEnd}>
          <Droppable droppableId="corkboard" direction="horizontal">
            {(provided) => (
              <Box
                ref={provided.innerRef}
                {...provided.droppableProps}
                sx={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fill, 200px)',
                  gap: 2,
                  minHeight: 600
                }}
              >
                {localItems.map((item, index) => (
                  <Draggable key={item.id} draggableId={item.id} index={index}>
                    {(provided, snapshot) => (
                      <Paper
                        ref={provided.innerRef}
                        {...provided.draggableProps}
                        {...provided.dragHandleProps}
                        elevation={snapshot.isDragging ? 8 : 2}
                        sx={{
                          backgroundColor: item.color || ITEM_COLORS[0],
                          padding: 2,
                          height: 200,
                          width: 200,
                          cursor: 'move',
                          position: 'relative',
                          transform: snapshot.isDragging ? 'rotate(5deg)' : 'rotate(-2deg)',
                          transition: 'transform 0.2s',
                          '&:hover': {
                            transform: 'rotate(0deg) scale(1.05)',
                            zIndex: 10
                          },
                          display: 'flex',
                          flexDirection: 'column'
                        }}
                      >
                        {/* Item Type Badge */}
                        <Typography
                          variant="caption"
                          sx={{
                            position: 'absolute',
                            top: 4,
                            right: 4,
                            backgroundColor: 'rgba(0,0,0,0.1)',
                            padding: '2px 6px',
                            borderRadius: 1,
                            fontSize: '0.65rem'
                          }}
                        >
                          {ITEM_TYPE_LABELS[item.type]}
                        </Typography>

                        {/* Title */}
                        <Typography
                          variant="subtitle2"
                          sx={{
                            fontWeight: 'bold',
                            mb: 1,
                            mt: 2,
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap'
                          }}
                        >
                          {item.title}
                        </Typography>

                        {/* Content */}
                        <Typography
                          variant="body2"
                          sx={{
                            flex: 1,
                            overflow: 'hidden',
                            fontSize: '0.75rem',
                            lineHeight: 1.4
                          }}
                        >
                          {item.content}
                        </Typography>

                        {/* Actions */}
                        <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 0.5, mt: 1 }}>
                          <Tooltip title="Edit">
                            <IconButton
                              size="small"
                              onClick={() => handleEditItem(item)}
                              sx={{ padding: 0.5 }}
                            >
                              <EditIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Delete">
                            <IconButton
                              size="small"
                              onClick={() => handleDeleteItem(item.id)}
                              sx={{ padding: 0.5 }}
                            >
                              <DeleteIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                        </Box>
                      </Paper>
                    )}
                  </Draggable>
                ))}
                {provided.placeholder}
              </Box>
            )}
          </Droppable>
        </DragDropContext>

        {/* Empty State */}
        {localItems.length === 0 && (
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              height: 400,
              color: 'white'
            }}
          >
            <Typography variant="h5" gutterBottom>
              Empty Corkboard
            </Typography>
            <Typography variant="body2" color="rgba(255,255,255,0.7)">
              Click the + button to add your first note
            </Typography>
          </Box>
        )}
      </Box>

      {/* Add Button */}
      <Fab
        color="primary"
        aria-label="add"
        onClick={() => setDialogOpen(true)}
        sx={{
          position: 'fixed',
          bottom: 32,
          right: 32
        }}
      >
        <AddIcon />
      </Fab>

      {/* Add/Edit Dialog */}
      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>{editingItem ? 'Edit Item' : 'Add New Item'}</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
            <FormControl fullWidth>
              <InputLabel>Type</InputLabel>
              <Select
                value={newItem.type}
                label="Type"
                onChange={(e) => setNewItem({ ...newItem, type: e.target.value as any })}
              >
                <MenuItem value="note">Note</MenuItem>
                <MenuItem value="scene">Scene</MenuItem>
                <MenuItem value="character">Character</MenuItem>
                <MenuItem value="plot_point">Plot Point</MenuItem>
              </Select>
            </FormControl>

            <TextField
              label="Title"
              value={newItem.title}
              onChange={(e) => setNewItem({ ...newItem, title: e.target.value })}
              fullWidth
            />

            <TextField
              label="Content"
              value={newItem.content}
              onChange={(e) => setNewItem({ ...newItem, content: e.target.value })}
              multiline
              rows={4}
              fullWidth
            />

            <FormControl fullWidth>
              <InputLabel>Color</InputLabel>
              <Select
                value={newItem.color}
                label="Color"
                onChange={(e) => setNewItem({ ...newItem, color: e.target.value })}
              >
                {ITEM_COLORS.map((color) => (
                  <MenuItem key={color} value={color}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Box
                        sx={{
                          width: 20,
                          height: 20,
                          backgroundColor: color,
                          border: '1px solid #ccc',
                          borderRadius: 0.5
                        }}
                      />
                      {color}
                    </Box>
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogOpen(false)}>Cancel</Button>
          <Button
            onClick={editingItem ? handleUpdateItem : handleAddItem}
            variant="contained"
            disabled={!newItem.title.trim()}
          >
            {editingItem ? 'Update' : 'Add'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

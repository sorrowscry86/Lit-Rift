import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Button,
  Typography,
  IconButton,
  Tooltip,
  Alert
} from '@mui/material';
import RefreshIcon from '@mui/icons-material/Refresh';
import AutoFixHighIcon from '@mui/icons-material/AutoFixHigh';
import { MatrixStructure } from '../../services/visualPlanningService';

interface MatrixGridProps {
  projectId: string;
  matrix: MatrixStructure | null;
  onMatrixChange: (matrix: MatrixStructure) => void;
  onGenerate: () => Promise<void>;
  onUpdateCell: (row: number, col: number, content: string) => Promise<void>;
}

export const MatrixGrid: React.FC<MatrixGridProps> = ({
  projectId,
  matrix,
  onMatrixChange,
  onGenerate,
  onUpdateCell
}) => {
  const [localMatrix, setLocalMatrix] = useState<MatrixStructure | null>(matrix);
  const [editingCell, setEditingCell] = useState<{ row: number; col: number } | null>(null);
  const [cellContent, setCellContent] = useState('');
  const [generating, setGenerating] = useState(false);

  useEffect(() => {
    setLocalMatrix(matrix);
  }, [matrix]);

  const getCellContent = (row: number, col: number): string => {
    if (!localMatrix) return '';
    const cell = localMatrix.cells.find(c => c.row === row && c.col === col);
    return cell?.content || '';
  };

  const handleCellClick = (row: number, col: number) => {
    setEditingCell({ row, col });
    setCellContent(getCellContent(row, col));
  };

  const handleCellSave = async () => {
    if (!editingCell || !localMatrix) return;

    const updatedCells = [...localMatrix.cells];
    const cellIndex = updatedCells.findIndex(
      c => c.row === editingCell.row && c.col === editingCell.col
    );

    if (cellIndex >= 0) {
      updatedCells[cellIndex] = { ...updatedCells[cellIndex], content: cellContent };
    } else {
      updatedCells.push({
        row: editingCell.row,
        col: editingCell.col,
        content: cellContent
      });
    }

    const updatedMatrix = { ...localMatrix, cells: updatedCells };
    setLocalMatrix(updatedMatrix);
    onMatrixChange(updatedMatrix);

    await onUpdateCell(editingCell.row, editingCell.col, cellContent);
    setEditingCell(null);
    setCellContent('');
  };

  const handleCellCancel = () => {
    setEditingCell(null);
    setCellContent('');
  };

  const handleGenerate = async () => {
    setGenerating(true);
    try {
      await onGenerate();
    } finally {
      setGenerating(false);
    }
  };

  if (!localMatrix) {
    return (
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          height: '100%',
          gap: 2
        }}
      >
        <Typography variant="h6" color="text.secondary">
          No Matrix Structure Yet
        </Typography>
        <Button
          variant="contained"
          startIcon={<AutoFixHighIcon />}
          onClick={handleGenerate}
          disabled={generating}
        >
          {generating ? 'Generating...' : 'Auto-Generate Matrix'}
        </Button>
        <Typography variant="body2" color="text.secondary" sx={{ maxWidth: 500, textAlign: 'center' }}>
          Generate a story matrix automatically from your plot points, or create a custom structure manually.
        </Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ width: '100%', height: '100%', overflow: 'auto', p: 2 }}>
      {/* Header */}
      <Box sx={{ mb: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h6">Story Matrix</Typography>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Tooltip title="Regenerate Matrix">
            <IconButton onClick={handleGenerate} disabled={generating}>
              <RefreshIcon />
            </IconButton>
          </Tooltip>
        </Box>
      </Box>

      <Alert severity="info" sx={{ mb: 2 }}>
        <Typography variant="body2">
          This matrix helps you structure your story across multiple dimensions. Rows typically represent acts or
          story threads, while columns represent plot points or character arcs.
        </Typography>
      </Alert>

      {/* Matrix Table */}
      <TableContainer component={Paper} sx={{ maxHeight: 'calc(100vh - 250px)' }}>
        <Table stickyHeader>
          <TableHead>
            <TableRow>
              <TableCell
                sx={{
                  backgroundColor: 'primary.main',
                  color: 'primary.contrastText',
                  fontWeight: 'bold',
                  minWidth: 150
                }}
              >
                {/* Empty corner cell */}
              </TableCell>
              {localMatrix.cols.map((col, colIndex) => (
                <TableCell
                  key={colIndex}
                  sx={{
                    backgroundColor: 'primary.main',
                    color: 'primary.contrastText',
                    fontWeight: 'bold',
                    minWidth: 200
                  }}
                >
                  {col}
                </TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {localMatrix.rows.map((row, rowIndex) => (
              <TableRow key={rowIndex}>
                <TableCell
                  component="th"
                  scope="row"
                  sx={{
                    backgroundColor: 'action.hover',
                    fontWeight: 'bold',
                    position: 'sticky',
                    left: 0,
                    zIndex: 1
                  }}
                >
                  {row}
                </TableCell>
                {localMatrix.cols.map((col, colIndex) => {
                  const isEditing =
                    editingCell?.row === rowIndex && editingCell?.col === colIndex;
                  const content = getCellContent(rowIndex, colIndex);

                  return (
                    <TableCell
                      key={colIndex}
                      onClick={() => !isEditing && handleCellClick(rowIndex, colIndex)}
                      sx={{
                        cursor: 'pointer',
                        backgroundColor: content ? 'background.paper' : 'action.hover',
                        '&:hover': {
                          backgroundColor: 'action.selected'
                        },
                        verticalAlign: 'top',
                        height: 120,
                        position: 'relative'
                      }}
                    >
                      {isEditing ? (
                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                          <TextField
                            autoFocus
                            multiline
                            rows={3}
                            value={cellContent}
                            onChange={(e) => setCellContent(e.target.value)}
                            fullWidth
                            size="small"
                            placeholder="Enter scene or plot details..."
                          />
                          <Box sx={{ display: 'flex', gap: 1, justifyContent: 'flex-end' }}>
                            <Button size="small" onClick={handleCellCancel}>
                              Cancel
                            </Button>
                            <Button size="small" variant="contained" onClick={handleCellSave}>
                              Save
                            </Button>
                          </Box>
                        </Box>
                      ) : (
                        <Typography
                          variant="body2"
                          sx={{
                            whiteSpace: 'pre-wrap',
                            wordBreak: 'break-word',
                            fontSize: '0.875rem'
                          }}
                        >
                          {content || (
                            <span style={{ color: '#999', fontStyle: 'italic' }}>
                              Click to add content...
                            </span>
                          )}
                        </Typography>
                      )}
                    </TableCell>
                  );
                })}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Legend */}
      <Box sx={{ mt: 2 }}>
        <Typography variant="caption" color="text.secondary">
          <strong>Tip:</strong> Click any cell to edit. Use this matrix to plan how different story elements interact
          across your narrative structure.
        </Typography>
      </Box>
    </Box>
  );
};

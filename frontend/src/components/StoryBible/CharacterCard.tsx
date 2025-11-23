import React from 'react';
import { Box, Card, CardContent, CardActions, Typography, Chip, Button, IconButton, Tooltip } from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import { Character } from '../../services/storyBibleService';

interface CharacterCardProps {
  character: Character;
  onClick?: () => void;
  onEdit?: (id: string) => void;
  onDelete?: (id: string) => void;
}

const CharacterCard: React.FC<CharacterCardProps> = ({ character, onClick, onEdit, onDelete }) => {
  const handleEdit = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onEdit) onEdit(character.id);
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onDelete) onDelete(character.id);
  };

  return (
    <Card 
      sx={{ 
        cursor: onClick ? 'pointer' : 'default',
        '&:hover': onClick ? { boxShadow: 6 } : {},
        height: '100%',
        display: 'flex',
        flexDirection: 'column'
      }}
      onClick={onClick}
    >
      <CardContent sx={{ flexGrow: 1 }}>
        <Typography variant="h6" gutterBottom component="div">
          {character.name}
        </Typography>
        <Typography variant="body2" color="text.secondary" paragraph>
          {character.description}
        </Typography>
        {character.traits.length > 0 && (
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mt: 2 }}>
            {character.traits.map((trait, index) => (
              <Chip key={index} label={trait} size="small" />
            ))}
          </Box>
        )}
      </CardContent>
      {(onEdit || onDelete) && (
        <CardActions disableSpacing sx={{ justifyContent: 'flex-end' }}>
          {onEdit && (
            <Tooltip title="Edit">
              <IconButton aria-label="edit" size="small" onClick={handleEdit}>
                <EditIcon />
              </IconButton>
            </Tooltip>
          )}
          {onDelete && (
            <Tooltip title="Delete">
              <IconButton aria-label="delete" size="small" onClick={handleDelete} color="error">
                <DeleteIcon />
              </IconButton>
            </Tooltip>
          )}
        </CardActions>
      )}
    </Card>
  );
};

export default CharacterCard;

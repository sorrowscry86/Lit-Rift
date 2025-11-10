import React from 'react';
import { Box, Card, CardContent, Typography, Chip } from '@mui/material';
import { Character } from '../../services/storyBibleService';

interface CharacterCardProps {
  character: Character;
  onClick?: () => void;
}

const CharacterCard: React.FC<CharacterCardProps> = ({ character, onClick }) => {
  return (
    <Card 
      sx={{ 
        cursor: onClick ? 'pointer' : 'default',
        '&:hover': onClick ? { boxShadow: 6 } : {}
      }}
      onClick={onClick}
    >
      <CardContent>
        <Typography variant="h6" gutterBottom>
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
    </Card>
  );
};

export default CharacterCard;
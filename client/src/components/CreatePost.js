
import { useState, useRef } from 'react';
import {
  Box,
  Paper,
  TextField,
  Button,
  IconButton,
  Typography,
  CircularProgress,
} from '@mui/material';

import CameraAltOutlinedIcon from '@mui/icons-material/CameraAltOutlined';
import MoodOutlinedIcon from '@mui/icons-material/MoodOutlined';
import SendIcon from '@mui/icons-material/Send';
import CloseIcon from '@mui/icons-material/Close';

import api from '../api/axios';
import { useAuth } from '../context/AuthContext';

export default function CreatePost({ onPostCreated }) {
  const [content, setContent] = useState('');
  const [image, setImage] = useState(null);
  const [preview, setPreview] = useState('');
  const [loading, setLoading] = useState(false);

  const fileRef = useRef();

  const handleImage = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setImage(file);
    setPreview(URL.createObjectURL(file));
  };

  const removeImage = () => {
    setImage(null);
    setPreview('');
    if (fileRef.current) fileRef.current.value = '';
  };

  const handleSubmit = async () => {
    if (!content.trim() && !image) return;
    setLoading(true);
    try {
      const formData = new FormData();
      if (content.trim()) formData.append('content', content.trim());
      if (image) formData.append('image', image);

      const { data } = await api.post('/posts', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      onPostCreated(data);
      setContent('');
      setImage(null);
      setPreview('');
      if (fileRef.current) fileRef.current.value = '';
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const isDisabled = loading || (!content.trim() && !image);

  return (
    <Paper
      elevation={0}
      sx={{
        borderRadius: '32px',
        p: { xs: 2.5, md: 3 },
        backgroundColor: '#fff',
        border: '1px solid #f0f0f0',
        mb: 3,
      }}
    >
      {/* ── Header ── */}
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          mb: 4,
          flexWrap: 'wrap',
          gap: 2,
        }}
      >
        <Typography
          sx={{
            fontSize: { xs: '2rem', md: '2.5rem' },
            fontWeight: 700,
            color: '#000',
          }}
        >
          Create Post
        </Typography>

        {/* Tab switcher */}
        <Box
          sx={{
            display: 'flex',
            backgroundColor: '#ececf1',
            borderRadius: '40px',
            p: '6px',
            minWidth: '280px',
          }}
        >
          {['All Posts', 'Promotions'].map((label, i) => (
            <Button
              key={label}
              disableElevation
              variant={i === 0 ? 'contained' : 'text'}
              sx={{
                flex: 1,
                borderRadius: '35px',
                py: 1.5,
                textTransform: 'none',
                fontSize: '1rem',
                fontWeight: i === 0 ? 600 : 500,
                ...(i === 0
                  ? {
                      backgroundColor: '#1877F2',
                      color: '#fff',
                      '&:hover': { backgroundColor: '#166FE5' },
                    }
                  : {
                      color: '#777',
                      '&:hover': { backgroundColor: 'transparent' },
                    }),
              }}
            >
              {label}
            </Button>
          ))}
        </Box>
      </Box>

      {/* ── Text input ── */}
      <TextField
        fullWidth
        multiline
        minRows={4}
        placeholder="What's on your mind?"
        value={content}
        onChange={(e) => setContent(e.target.value)}
        variant="standard"
        slotProps={{ input: { disableUnderline: true } }}
        sx={{
          mb: 2,
          '& textarea': {
            fontSize: { xs: '1.5rem', md: '2rem' },
            color: '#666',
            lineHeight: 1.5,
          },
        }}
      />

      {/* ── Image preview ── */}
      {preview && (
        <Box sx={{ position: 'relative', mb: 2 }}>
          <Box
            component="img"
            src={preview}
            alt="preview"
            sx={{
              width: '100%',
              maxHeight: '300px',
              objectFit: 'cover',
              borderRadius: '16px',
              display: 'block',
            }}
          />
          <IconButton
            onClick={removeImage}
            size="small"
            sx={{
              position: 'absolute',
              top: 10,
              right: 10,
              backgroundColor: 'rgba(0,0,0,0.6)',
              color: '#fff',
              '&:hover': { backgroundColor: 'rgba(0,0,0,0.8)' },
            }}
          >
            <CloseIcon fontSize="small" />
          </IconButton>
        </Box>
      )}

      {/* ── Divider ── */}
      <Box sx={{ borderBottom: '2px solid #f1f1f1', mb: 2 }} />

      {/* ── Bottom actions ── */}
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: 2,
        }}
      >
        {/* Left icons */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
          <IconButton
            onClick={() => fileRef.current?.click()}
            sx={{ color: '#1877F2' }}
            aria-label="Add photo"
          >
            <CameraAltOutlinedIcon fontSize="large" />
          </IconButton>

          <IconButton sx={{ color: '#1877F2' }} aria-label="Add emoji">
            <MoodOutlinedIcon fontSize="large" />
          </IconButton>

          

          

          <input
            hidden
            ref={fileRef}
            type="file"
            accept="image/*"
            onChange={handleImage}
          />
        </Box>

        {/* Post button */}
        <Button
          variant="contained"
          onClick={handleSubmit}
          disabled={isDisabled}
          sx={{
            minWidth: '180px',
            height: '70px',
            borderRadius: '35px',
            backgroundColor: isDisabled ? '#d6d6dc' : '#1877F2',
            color: '#fff',
            fontWeight: 700,
            fontSize: '1.3rem',
            textTransform: 'none',
            boxShadow: 'none',
            transition: 'background-color 0.2s',
            '&:hover': {
              backgroundColor: isDisabled ? '#d6d6dc' : '#166FE5',
              boxShadow: 'none',
            },
            '&.Mui-disabled': {
              color: '#fff',
            },
          }}
        >
          {loading ? (
            <CircularProgress size={24} sx={{ color: '#fff' }} />
          ) : (
            <>
              <SendIcon sx={{ mr: 1 }} />
              Post
            </>
          )}
        </Button>
      </Box>
    </Paper>
  );
}

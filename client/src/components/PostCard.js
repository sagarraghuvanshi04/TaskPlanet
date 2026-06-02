import { useState } from 'react';
import {
  Card, CardHeader, CardContent, CardActions, Avatar,
  IconButton, Typography, Box, TextField, Button,
  Collapse, Divider, Tooltip
} from '@mui/material';
import FavoriteIcon from '@mui/icons-material/Favorite';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import ChatBubbleOutlineIcon from '@mui/icons-material/ChatBubbleOutlineRounded';
import ShareOutlinedIcon from '@mui/icons-material/ShareOutlined';
import SendIcon from '@mui/icons-material/Send';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';

const timeAgo = date => {
  const diff = (Date.now() - new Date(date)) / 1000;
  if (diff < 60) return 'just now';
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
};

export default function PostCard({ post: initialPost }) {
  const { user } = useAuth();
  const [post, setPost] = useState(initialPost);
  const [showComments, setShowComments] = useState(false);
  const [commentText, setCommentText] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const isLiked = post.likes.includes(user?.id);
  const [liking, setLiking] = useState(false);

  const handleLike = async () => {
    if (liking) return; // prevent double click
    setLiking(true);
    // Optimistic update — instant UI response
    const wasLiked = post.likes.includes(user?.id);
    setPost(prev => ({
      ...prev,
      likes: wasLiked
        ? prev.likes.filter(id => id !== user?.id)
        : [...prev.likes, user?.id],
      likedUsernames: wasLiked
        ? prev.likedUsernames.filter(u => u !== user?.username)
        : [...prev.likedUsernames, user?.username],
    }));
    try {
      const { data } = await api.put(`/posts/${post._id}/like`);
      setPost(data); // sync with server truth
    } catch (err) {
      setPost(prev => ({ ...prev })); // revert on error
      console.error(err);
    } finally {
      setLiking(false);
    }
  };

  const handleComment = async () => {
    if (!commentText.trim()) return;
    setSubmitting(true);
    try {
      const { data } = await api.post(`/posts/${post._id}/comment`, { text: commentText.trim() });
      setPost(data);
      setCommentText('');
    } catch (err) {
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Card
      elevation={0}
      sx={{
        borderRadius: '20px',
        mb: 2,
        border: '1px solid #e8e8ed',
        backgroundColor: '#fff',
        overflow: 'hidden',
      }}
    >
      {/* ── Header ── */}
      <CardHeader
        avatar={
          <Avatar
            sx={{
              width: 52,
              height: 52,
              bgcolor: '#4a90d9',
              fontSize: 20,
              fontWeight: 700,
              border: '2px solid #e8e8ed',
            }}
          >
            {post.username?.[0]?.toUpperCase()}
          </Avatar>
        }
        title={
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
            <Typography sx={{ fontWeight: 700, fontSize: '1.05rem', color: '#000' }}>
              {post.username}
            </Typography>
            <Typography sx={{ fontSize: '1.05rem', color: '#555' }}>
              @{post.username?.toLowerCase()}
            </Typography>
            {/* Verified badge */}
            <Box
              component="span"
              sx={{
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: 18,
                height: 18,
                borderRadius: '50%',
                backgroundColor: '#aaa',
                ml: 0.3,
              }}
            >
              <Typography sx={{ fontSize: '10px', color: '#fff', lineHeight: 1 }}>★</Typography>
            </Box>
          </Box>
        }
        subheader={
          <Typography variant="caption" sx={{ color: '#999', fontSize: '0.85rem' }}>
            {timeAgo(post.createdAt)}
          </Typography>
        }
        action={
          <Button
            variant="contained"
            disableElevation
            sx={{
              borderRadius: '50px',
              backgroundColor: '#1877F2',
              color: '#fff',
              fontWeight: 700,
              fontSize: '0.95rem',
              textTransform: 'none',
              px: 2.5,
              py: 0.8,
              mt: 1,
              mr: 0.5,
              '&:hover': { backgroundColor: '#166FE5' },
            }}
          >
            Follow
          </Button>
        }
        sx={{ pb: 1, pt: 2, px: 2.5 }}
      />

      {/* ── Content ── */}
      <CardContent sx={{ pt: 0.5, pb: 1, px: 2.5 }}>
        {post.content && (
          <Typography
            sx={{
              fontSize: '1.3rem',
              fontWeight: 500,
              color: '#111',
              lineHeight: 1.5,
              mb: post.image ? 1.5 : 0,
            }}
          >
            {post.content}
          </Typography>
        )}
        {post.image && (
          <Box sx={{ borderRadius: '12px', overflow: 'hidden', mt: 1 }}>
            <img
              src={post.image}
              alt="post"
              style={{ width: '100%', maxHeight: 400, objectFit: 'cover', display: 'block' }}
            />
          </Box>
        )}
      </CardContent>

      {/* ── Like / comment count row ── */}
      {(post.likes.length > 0 || post.comments.length > 0) && (
        <Box sx={{ px: 2.5, pb: 0.5 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
            <Tooltip title={post.likedUsernames?.join(', ') || ''} placement="top">
              <Typography variant="caption" color="text.secondary" sx={{ cursor: 'default' }}>
                {post.likes.length > 0
                  ? `${post.likes.length} like${post.likes.length > 1 ? 's' : ''}`
                  : ''}
              </Typography>
            </Tooltip>
            <Typography
              variant="caption"
              color="text.secondary"
              sx={{ cursor: 'pointer', '&:hover': { textDecoration: 'underline' } }}
              onClick={() => setShowComments(v => !v)}
            >
              {post.comments.length > 0
                ? `${post.comments.length} comment${post.comments.length > 1 ? 's' : ''}`
                : ''}
            </Typography>
          </Box>
        </Box>
      )}

      {/* ── Divider ── */}
      <Divider sx={{ mx: 2.5, borderColor: '#ebebeb' }} />

      {/* ── Action buttons ── */}
      <CardActions sx={{ px: 1.5, py: 0.5, justifyContent: 'space-around' }}>
        {/* Like */}
        <Button
          startIcon={
            isLiked ? (
              <FavoriteIcon sx={{ color: '#e0245e', fontSize: '1.4rem !important' }} />
            ) : (
              <FavoriteBorderIcon sx={{ color: '#888', fontSize: '1.4rem !important' }} />
            )
          }
          onClick={handleLike}
          size="small"
          sx={{
            flex: 1,
            color: isLiked ? '#e0245e' : '#888',
            fontWeight: 600,
            fontSize: '1rem',
            borderRadius: '12px',
            textTransform: 'none',
            gap: 0.5,
            '&:hover': { backgroundColor: '#fef0f3' },
          }}
        >
          {post.likes.length}
        </Button>

        {/* Comment */}
        <Button
          startIcon={<ChatBubbleOutlineIcon sx={{ color: '#888', fontSize: '1.4rem !important' }} />}
          onClick={() => setShowComments(v => !v)}
          size="small"
          sx={{
            flex: 1,
            color: '#888',
            fontWeight: 600,
            fontSize: '1rem',
            borderRadius: '12px',
            textTransform: 'none',
            gap: 0.5,
            '&:hover': { backgroundColor: '#f0f2f5' },
          }}
        >
          {post.comments.length}
        </Button>

        {/* Share */}
        <Button
          startIcon={<ShareOutlinedIcon sx={{ color: '#888', fontSize: '1.4rem !important' }} />}
          size="small"
          sx={{
            flex: 1,
            color: '#888',
            fontWeight: 600,
            fontSize: '1rem',
            borderRadius: '12px',
            textTransform: 'none',
            gap: 0.5,
            '&:hover': { backgroundColor: '#f0f2f5' },
          }}
        >
          0
        </Button>
      </CardActions>

      {/* ── Comments section ── */}
      <Collapse in={showComments}>
        <Divider sx={{ borderColor: '#ebebeb' }} />
        <Box sx={{ px: 2.5, py: 1.5 }}>
          {post.comments.map((c, i) => (
            <Box key={i} sx={{ display: 'flex', gap: 1, mb: 1.5 }}>
              <Avatar sx={{ bgcolor: 'secondary.main', width: 30, height: 30, fontSize: 12 }}>
                {c.username?.[0]?.toUpperCase()}
              </Avatar>
              <Box
                sx={{
                  bgcolor: '#f0f2f5',
                  borderRadius: '12px',
                  px: 1.5,
                  py: 0.8,
                  flex: 1,
                }}
              >
                <Typography variant="caption" fontWeight={700}>{c.username}</Typography>
                <Typography variant="body2" fontSize={13}>{c.text}</Typography>
              </Box>
            </Box>
          ))}

          {/* Comment input */}
          <Box sx={{ display: 'flex', gap: 1, mt: 1 }}>
            <Avatar sx={{ bgcolor: 'primary.main', width: 30, height: 30, fontSize: 12 }}>
              {user?.username?.[0]?.toUpperCase()}
            </Avatar>
            <TextField
              fullWidth
              size="small"
              placeholder="Write a comment..."
              value={commentText}
              onChange={e => setCommentText(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && !e.shiftKey && handleComment()}
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: '20px',
                  bgcolor: '#f0f2f5',
                },
              }}
              slotProps={{
                input: {
                  endAdornment: (
                    <IconButton
                      size="small"
                      onClick={handleComment}
                      disabled={submitting || !commentText.trim()}
                    >
                      <SendIcon
                        fontSize="small"
                        color={commentText.trim() ? 'primary' : 'disabled'}
                      />
                    </IconButton>
                  ),
                },
              }}
            />
          </Box>
        </Box>
      </Collapse>
    </Card>
  );
}

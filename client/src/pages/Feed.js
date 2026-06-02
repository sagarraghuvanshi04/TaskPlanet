import { useState, useEffect, useCallback } from 'react';
import { Box, Container, CircularProgress, Typography, Button } from '@mui/material';
import PostCard from '../components/PostCard';
import CreatePost from '../components/CreatePost';
import api from '../api/axios';

export default function Feed() {
  const [posts, setPosts] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(false);
  const [initialLoad, setInitialLoad] = useState(true);

  const fetchPosts = useCallback(async (pageNum = 1, append = false) => {
    setLoading(true);
    try {
      const { data } = await api.get(`/posts?page=${pageNum}`);
      setPosts(prev => append ? [...prev, ...data.posts] : data.posts);
      setTotalPages(data.totalPages);
      setPage(data.currentPage);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
      setInitialLoad(false);
    }
  }, []);

  useEffect(() => { fetchPosts(1); }, [fetchPosts]);

  const handlePostCreated = newPost => {
    setPosts(prev => [newPost, ...prev]);
  };

  const loadMore = () => fetchPosts(page + 1, true);

  if (initialLoad) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 8 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Container maxWidth="sm" sx={{ py: 3 }}>
      <CreatePost onPostCreated={handlePostCreated} />
      {posts.length === 0 ? (
        <Box sx={{ textAlign: 'center', mt: 6 }}>
          <Typography color="text.secondary">No posts yet. Be the first to post!</Typography>
        </Box>
      ) : (
        posts.map(post => <PostCard key={post._id} post={post} />)
      )}
      {page < totalPages && (
        <Box sx={{ textAlign: 'center', mt: 2 }}>
          <Button variant="outlined" onClick={loadMore} disabled={loading} sx={{ borderRadius: 2 }}>
            {loading ? <CircularProgress size={20} /> : 'Load more'}
          </Button>
        </Box>
      )}
    </Container>
  );
}

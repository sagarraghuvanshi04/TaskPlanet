const router = require('express').Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const Post = require('../models/Post');

const uploadDir = path.join(__dirname, '..', 'uploads');
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir);
const auth = require('../middleware/auth');

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => cb(null, Date.now() + path.extname(file.originalname)),
});
const upload = multer({ storage, limits: { fileSize: 20 * 1024 * 1024 } });

// Get feed with pagination
router.get('/', auth, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = 10;
    const posts = await Post.find()
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .lean();
    const total = await Post.countDocuments();
    res.json({ posts, totalPages: Math.ceil(total / limit) || 1, currentPage: page });
  } catch (err) {
    console.error('GET /posts error:', err.message);
    res.status(500).json({ message: err.message });
  }
});

// Create post
router.post('/', auth, (req, res, next) => {
  upload.single('image')(req, res, err => {
    if (err) return res.status(400).json({ message: err.message });
    next();
  });
}, async (req, res) => {
  try {
    const { content } = req.body;
    const image = req.file ? `/uploads/${req.file.filename}` : '';
    if (!content && !image)
      return res.status(400).json({ message: 'Post must have text or image' });

    const post = await Post.create({
      userId: req.user.id,
      username: req.user.username,
      content: content || '',
      image,
    });
    res.status(201).json(post);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Like / Unlike post
router.put('/:id/like', auth, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ message: 'Post not found' });

    const alreadyLiked = post.likes.includes(req.user.id);
    if (alreadyLiked) {
      post.likes = post.likes.filter(id => id.toString() !== req.user.id);
      post.likedUsernames = post.likedUsernames.filter(u => u !== req.user.username);
    } else {
      post.likes.push(req.user.id);
      post.likedUsernames.push(req.user.username);
    }
    await post.save();
    res.json(post);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Add comment
router.post('/:id/comment', auth, async (req, res) => {
  try {
    const { text } = req.body;
    if (!text) return res.status(400).json({ message: 'Comment text required' });

    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ message: 'Post not found' });

    post.comments.push({ userId: req.user.id, username: req.user.username, text });
    await post.save();
    res.json(post);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;

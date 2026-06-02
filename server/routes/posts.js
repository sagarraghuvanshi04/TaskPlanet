const router = require('express').Router();
const multer = require('multer');
const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const Post = require('../models/Post');
const auth = require('../middleware/auth');

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const storage = new CloudinaryStorage({
  cloudinary,
  params: { folder: 'taskplanet', allowed_formats: ['jpg', 'jpeg', 'png', 'gif', 'webp'] },
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
    // Cloudinary returns full URL in req.file.path
    const image = req.file ? req.file.path : '';
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

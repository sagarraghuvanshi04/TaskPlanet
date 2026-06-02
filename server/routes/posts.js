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
    // Run both queries in parallel instead of sequentially
    const [posts, total] = await Promise.all([
      Post.find()
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .lean(),
      Post.countDocuments(),
    ]);
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

// Like / Unlike post — atomic update, single DB round trip
router.put('/:id/like', auth, async (req, res) => {
  try {
    const userId = req.user.id;
    const username = req.user.username;

    // Check if already liked first
    const post = await Post.findById(req.params.id).select('likes').lean();
    if (!post) return res.status(404).json({ message: 'Post not found' });

    const alreadyLiked = post.likes.map(id => id.toString()).includes(userId);
    const update = alreadyLiked
      ? { $pull: { likes: userId, likedUsernames: username } }
      : { $addToSet: { likes: userId, likedUsernames: username } };

    const updated = await Post.findByIdAndUpdate(req.params.id, update, { new: true }).lean();
    res.json(updated);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Add comment — atomic update, single DB round trip
router.post('/:id/comment', auth, async (req, res) => {
  try {
    const { text } = req.body;
    if (!text) return res.status(400).json({ message: 'Comment text required' });

    const updated = await Post.findByIdAndUpdate(
      req.params.id,
      { $push: { comments: { userId: req.user.id, username: req.user.username, text } } },
      { new: true }
    ).lean();
    if (!updated) return res.status(404).json({ message: 'Post not found' });
    res.json(updated);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;

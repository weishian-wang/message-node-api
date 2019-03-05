const express = require('express');

const feedController = require('../controllers/feed');
const isAuth = require('../middleware/isAuth');

const router = express.Router();

// GET /feed/posts
router.get('/posts', isAuth, feedController.getPosts);

// GET /feed/post/:postId
router.get('/post/:postId', isAuth, feedController.getSinglePost);

// POST /feed/post
router.post(
  '/post',
  isAuth,
  feedController.postValidation(),
  feedController.createPost
);

// PUT /feed/post/:postId
router.put(
  '/post/:postId',
  isAuth,
  feedController.postValidation(),
  feedController.updatePost
);

router.delete('/post/:postId', isAuth, feedController.deletePost);

module.exports = router;

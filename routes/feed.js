const express = require('express');

const feedController = require('../controllers/feed');

const router = express.Router();

// GET /feed/posts
router.get('/posts', feedController.getPosts);

// GET /feed/post/:postId
router.get('/post/:postId', feedController.getSinglePost);

// POST /feed/post
router.post(
  '/post',
  feedController.postValidation(),
  feedController.createPost
);

// PUT /feed/post/:postId
router.put(
  '/post/:postId',
  feedController.postValidation(),
  feedController.updatePost
);

router.delete('/post/:postId', feedController.deletePost);

module.exports = router;

const fs = require('fs');
const path = require('path');

const { body } = require('express-validator/check');
const { validationResult } = require('express-validator/check');

const Post = require('../models/post');

exports.getPosts = (req, res, next) => {
  Post.find()
    .sort({ createdAt: -1 })
    .then(posts => {
      res.status(200).json({ posts: posts });
    })
    .catch(next);
};

exports.getSinglePost = (req, res, next) => {
  const postId = req.params.postId;
  Post.findById(postId)
    .then(post => {
      if (!post) {
        const error = new Error('Post not found.');
        error.statusCode = 404;
        throw error;
      }
      res.status(200).json({ post: post });
    })
    .catch(next);
};

exports.createPost = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const error = new Error('Validation failed. Entered data is incorrect.');
    error.statusCode = 422;
    throw error;
  }
  if (!req.file) {
    const error = new Error('No image provided.');
    error.statusCode = 422;
    throw error;
  }
  const imageUrl = req.file.path.replace('\\', '/');
  const title = req.body.title;
  const content = req.body.content;
  const post = new Post({
    title: title,
    imageUrl: imageUrl,
    content: content,
    creator: { name: 'Node.js' }
  });
  post
    .save()
    .then(result => {
      res.status(201).json({
        message: 'Created a post successfully.',
        post: result
      });
    })
    .catch(next);
};

exports.updatePost = (req, res, next) => {
  const postId = req.params.postId;
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const error = new Error('Validation failed. Entered data is incorrect.');
    error.statusCode = 422;
    throw error;
  }
  let imageUrl = req.body.image;
  if (req.file) {
    imageUrl = req.file.path.replace('\\', '/');
  }
  if (!imageUrl) {
    const error = new Error('No image provided.');
    error.statusCode = 422;
    throw error;
  }
  const title = req.body.title;
  const content = req.body.content;
  Post.findById(postId)
    .then(post => {
      if (!post) {
        const error = new Error('Post not found.');
        error.statusCode = 404;
        throw error;
      }
      if (imageUrl !== post.imageUrl) {
        clearImage(post.imageUrl);
      }
      post.title = title;
      post.imageUrl = imageUrl;
      post.content = content;
      return post.save();
    })
    .then(result => {
      res.status(200).json({ post: result });
    })
    .catch(next);
};

exports.postValidation = () => {
  return [
    body('title')
      .trim()
      .isLength({ min: 2 }),
    body('content')
      .trim()
      .isLength({ min: 5 })
  ];
};

const clearImage = filePath => {
  filePath = path.join(__dirname, '..', filePath);
  fs.unlink(filePath, err => {
    if (err) throw err;
    console.log(`${filePath} was deleted.`);
  });
};

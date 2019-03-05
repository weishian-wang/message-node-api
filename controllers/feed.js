const fs = require('fs');
const path = require('path');

const { body } = require('express-validator/check');
const { validationResult } = require('express-validator/check');

const Post = require('../models/post');
const User = require('../models/user');

exports.getPosts = (req, res, next) => {
  const currentPage = req.query.page || 1;
  const POST_PER_PAGE = 3;
  let totalItems;
  Post.find()
    .countDocuments()
    .then(count => {
      totalItems = count;
      return Post.find()
        .populate('creator', 'name')
        .sort({ createdAt: -1 })
        .skip((currentPage - 1) * POST_PER_PAGE)
        .limit(POST_PER_PAGE);
    })
    .then(posts => {
      res.status(200).json({
        posts: posts,
        totalItems: totalItems,
        POST_PER_PAGE: POST_PER_PAGE
      });
    })
    .catch(next);
};

exports.getSinglePost = (req, res, next) => {
  const postId = req.params.postId;
  Post.findById(postId)
    .populate('creator', 'name')
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
  let creator;
  const post = new Post({
    title: title,
    imageUrl: imageUrl,
    content: content,
    creator: req.userId
  });
  post
    .save()
    .then(result => {
      return User.findById(req.userId);
    })
    .then(user => {
      creator = user;
      user.posts.push(post);
      return user.save();
    })
    .then(result => {
      res.status(201).json({
        message: 'Created a post successfully.',
        post: post,
        creator: { _id: creator._id, name: creator.name }
      });
    })
    .catch(next);
};

exports.updatePost = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const error = new Error('Validation failed. Entered data is incorrect.');
    error.statusCode = 422;
    throw error;
  }
  const postId = req.params.postId;
  let imageUrl = req.body.image;
  if (req.file) {
    imageUrl = req.file.path.replace('\\', '/');
  }
  if (imageUrl === 'undefined') {
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
      if (post.creator.toString() !== req.userId) {
        const error = new Error('Not authorized.');
        error.statusCode = 403;
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

exports.deletePost = (req, res, next) => {
  const postId = req.params.postId;
  Post.findById(postId)
    .then(post => {
      if (!post) {
        const error = new Error('Post not found.');
        error.statusCode = 404;
        throw error;
      }
      if (post.creator.toString() !== req.userId) {
        const error = new Error('Not authorized.');
        error.statusCode = 403;
        throw error;
      }
      clearImage(post.imageUrl);
      return Post.findByIdAndDelete(postId);
    })
    .then(result => {
      return User.findById(req.userId)
    })
    .then(user => {
      user.posts.pull(postId);
      return user.save();
    })
    .then(result => {
      res.status(200).json({ message: 'Post has been deleted.' });
    })
    .catch(next);
};

exports.getStatus = (req, res, next) => {
  User.findById(req.userId)
    .then(user => {
      if (!user) {
        const error = new Error('User not found.');
        error.statusCode = 401;
        throw error;
      }
      res.status(200).json({ status: user.status });
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
    if (err) console.log(err);
    else console.log(`${filePath} was deleted.`);
  });
};

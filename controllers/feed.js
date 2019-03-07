const fs = require('fs');
const path = require('path');

const { body } = require('express-validator/check');
const { validationResult } = require('express-validator/check');

const io = require('../socket');
const Post = require('../models/post');
const User = require('../models/user');

exports.getPosts = async (req, res, next) => {
  const currentPage = req.query.page || 1;
  const POST_PER_PAGE = 3;

  try {
    const totalItems = await Post.find().countDocuments();
    const posts = await Post.find()
      .populate('creator', 'name')
      .sort({ createdAt: -1 })
      .skip((currentPage - 1) * POST_PER_PAGE)
      .limit(POST_PER_PAGE);

    res.status(200).json({
      posts: posts,
      totalItems: totalItems,
      POST_PER_PAGE: POST_PER_PAGE
    });
  } catch (err) {
    next(err);
  }
};

exports.getSinglePost = async (req, res, next) => {
  const postId = req.params.postId;

  try {
    const post = await Post.findById(postId).populate('creator', 'name');
    if (!post) {
      const error = new Error('Post not found.');
      error.statusCode = 404;
      throw error;
    }
    res.status(200).json({ post: post });
  } catch (err) {
    next(err);
  }
};

exports.createPost = async (req, res, next) => {
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
    creator: req.userId
  });

  try {
    const savedPost = await post.save();
    const user = await User.findById(req.userId);
    user.posts.push(savedPost);
    await user.save();

    io.getIO().emit('posts', {
      action: 'create',
      post: { ...savedPost._doc, creator: { _id: user._id, name: user.name } }
    });

    res.status(201).json({ message: 'Post created successfully.' });
  } catch (err) {
    next(err);
  }
};

exports.updatePost = async (req, res, next) => {
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

  try {
    const post = await Post.findById(postId).populate('creator', 'name');
    if (!post) {
      const error = new Error('Post not found.');
      error.statusCode = 404;
      throw error;
    }
    if (post.creator._id.toString() !== req.userId) {
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
    const updatedPost = await post.save();

    io.getIO().emit('posts', {
      action: 'update',
      post: { ...updatedPost._doc }
    });

    res.status(200).json({ message: 'Post updated successfully.' });
  } catch (err) {
    next(err);
  }
};

exports.deletePost = async (req, res, next) => {
  const postId = req.params.postId;

  try {
    const post = await Post.findById(postId);
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
    await Post.findByIdAndDelete(postId);
    const user = await User.findById(post.creator);
    user.posts.pull(postId);
    await user.save();
    clearImage(post.imageUrl);

    io.getIO().emit('posts', { action: 'delete', postId: postId });

    res.status(200).json({ message: 'Post deleted successfully.' });
  } catch (err) {
    next(err);
  }
};

exports.getStatus = async (req, res, next) => {
  try {
    const user = await User.findById(req.userId);
    if (!user) {
      const error = new Error('User not found.');
      error.statusCode = 401;
      throw error;
    }
    res.status(200).json({ status: user.status });
  } catch (err) {
    next(err);
  }
};

exports.updateStatus = async (req, res, next) => {
  const newStatus = req.body.status;

  try {
    const user = await User.findById(req.userId);
    if (!user) {
      const error = new Error('User not found.');
      error.statusCode = 401;
      throw error;
    }
    user.status = newStatus;
    await user.save();
    res.status(200).json({ message: 'User status has been updated.' });
  } catch (err) {
    next(err);
  }
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

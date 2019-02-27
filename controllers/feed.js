const dummyPosts = [
  {
    _id: '101',
    creator: {
      name: 'tester'
    },
    createdAt: new Date(),
    title: 'Lizard',
    content:
      'Lizards are a widespread group of squamate reptiles, with over 6,000 species, ranging across all continents except Antarctica',
    imageUrl:
      'https://material-ui.com/static/images/cards/contemplative-reptile.jpg'
  },
  {
    _id: '102',
    creator: {
      name: 'tester'
    },
    createdAt: new Date(),
    title: 'Lizard',
    content:
      'Lizards are a widespread group of squamate reptiles, with over 6,000 species, ranging across all continents except Antarctica',
    imageUrl:
      'https://material-ui.com/static/images/cards/contemplative-reptile.jpg'
  },
  {
    _id: '103',
    creator: {
      name: 'tester'
    },
    createdAt: new Date(),
    title: 'Lizard',
    content:
      'Lizards are a widespread group of squamate reptiles, with over 6,000 species, ranging across all continents except Antarctica',
    imageUrl:
      'https://material-ui.com/static/images/cards/contemplative-reptile.jpg'
  },
  {
    _id: '104',
    creator: {
      name: 'tester'
    },
    createdAt: new Date(),
    title: 'Lizard',
    content:
      'Lizards are a widespread group of squamate reptiles, with over 6,000 species, ranging across all continents except Antarctica',
    imageUrl:
      'https://material-ui.com/static/images/cards/contemplative-reptile.jpg'
  }
];

const { validationResult } = require('express-validator/check');

const Post = require('../models/post');

exports.getPosts = (req, res, next) => {
  Post.find()
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
  const title = req.body.title;
  const content = req.body.content;
  const post = new Post({
    title: title,
    imageUrl: 'http://localhost:8080/images/bunny-and-bear.jpg',
    content: content,
    creator: 'Node.js'
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

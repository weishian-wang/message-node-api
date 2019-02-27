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
  },
  {
    _id: '105',
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
    _id: '106',
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
  res.status(200).json({
    posts: dummyPosts
  });
};

exports.createPost = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(422).json({
      message: 'Validation failed. Entered data is incorrect.',
      errors: errors.array()
    });
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
    .catch(console.log);
};

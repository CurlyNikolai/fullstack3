const Blogs = require('../models/blog')

const initialBlogs = [
  {
    title: "First api blog",
    author: "Blogger 1",
    url: "url1",
    likes: 10
  },
  {
    title: "Second api blog",
    author: "Blogger 2",
    url: "url2",
    likes: 14
  },
  {
    title: "Third api blog",
    author: "Blogger 3",
    url: "url3",
    likes: 2
  },
  {
    title: "Fourth api blog",
    author: "Blogger 1",
    url: "url4",
    likes: 1
  }
]

const blogsInDb = async () => {
  const blogs = await Blogs.find({})
  return blogs.map(blog => blog.toJSON())
}

module.exports = {
  initialBlogs,
  blogsInDb
}
var _ = require('lodash')

const dummy = (blogs) => {
	return 1
}

const totalLikes = (blogs) => {
	return blogs.reduce((sum, blog) => {
			return sum + blog.likes
	}, 0)
}

const favoriteBlog = (blogs) => {

	const reducer = (favBlog, newBlog) => {
		return favBlog.likes > newBlog.likes ? favBlog : newBlog
	}
	const defaultBlog = {title: "", author: "", likes: -1}

	const favBlog = blogs.reduce(reducer, defaultBlog)

	return {title: favBlog.title, author: favBlog.author, likes: favBlog.likes}
}

const mostBlogs = (blogs) => {
	var authorBlogCounts = _(blogs).groupBy('author')
		.map((e, author) => ({
			author, blogs: e.length
		}))
		.value()
	return mostBlogs
}

module.exports = {
	dummy,
	totalLikes,
	favoriteBlog,
	mostBlogs
}
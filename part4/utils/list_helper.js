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

	var most = authorBlogCounts.reduce((prev, curr) => {
		var return_val = (curr.blogs > prev.blogs) ? curr : prev
		return return_val
	}, {author: "", blogs: -1})

	return most
}

const mostLikes = (blogs) => {
	var likeCounts = _(blogs).groupBy('author')
		.map((e, author) => ({
			author, likes: e.reduce((prev, curr) => {return prev + curr.likes}, 0)
		}))
		.value()

	var most = likeCounts.reduce((prev, curr) => {
		var return_val = (curr.likes > prev.likes) ? curr : prev
		return return_val
	}, {author: "", likes: -1})
	console.log(most)
	return most
}

module.exports = {
	dummy,
	totalLikes,
	favoriteBlog,
	mostBlogs,
	mostLikes
}
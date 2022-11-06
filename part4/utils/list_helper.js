
const dummy = (blogs) => {
	return 1
}

const totalLikes = (blogs) => {
	return blogs.reduce((sum, blog) => {
			return sum + blog.likes
	}, 0)
}

const favoriteBlog = (blogs) => {
	const favBlog = blogs.reduce((favBlog, newBlog) => {
		return favBlog.likes > newBlog.likes ? favBlog : newBlog
	}, {title: "", author: "", likes: -1})
	return {title: favBlog.title, author: favBlog.author, likes: favBlog.likes}
}

module.exports = {
	dummy,
	totalLikes,
	favoriteBlog
}
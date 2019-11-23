const dummy = (_blogs) => {
  _blogs
  return 1
}

const totalLikes = (blogs) => {
  return blogs.length === 0 ? 0 : blogs.reduce((sum, item) => sum + item.likes, 0)
}

const favouritePost = (blogs) => {
  return blogs.reduce((previous, next) => next.likes > previous.likes ? next : previous)
}

const mostLikes = array => {
  if (array.length === 0) return null

  let bestValue = 0
  let bestAuthor = null
  const map = new Map()


  array.forEach(element => {

    const value = map.get(element.author)
    let newValue = 0
    if (value == null) {
      newValue = element.likes
    } else {
      newValue = element.likes + value
    }

    map.set(element.author, element.likes)

    if (newValue > bestValue) {
      bestValue = newValue
      bestAuthor = element.author
    }

  })

  return {
    author: bestAuthor,
    likes: bestValue
  }
}

const mostBlogs = array => {
  const map = new Map()

  let bestValue = 0
  let bestAuthor = null

  array.forEach(element => {
    let newValue = 0
    const value = map.get(element.author)
    if (value == null) {
      newValue = 1
    } else {
      newValue = value + 1
    }

    map.set(element.author, newValue)

    if (newValue > bestValue) {
      bestValue = newValue
      bestAuthor = element.author
    }
  })

  return {
    author: bestAuthor,
    blogs: bestValue
  }
}

module.exports = {
  dummy,
  mostLikes,
  mostBlogs,
  totalLikes,
  favouritePost
}
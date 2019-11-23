const dummy = (_blogs) => {
  _blogs
  return 1
}

const totalLikes = (blogs) => {
  return blogs.length === 0 ? 0 : blogs.reduce((sum, item) => sum + item.likes, 0)
}

const favouritePost = (blogs) => {
  return blogs.reduce( (previous, next) => next.likes > previous.likes ? next : previous)
}

const mostBlogs = array => {
  if(array.length === 0) return null
  
  let bestValue = 0
  let bestAuthor = null
  const map = new Map()


  array.forEach(element => {

    const value = map.get(element.author)
    let newValue = 0
    if( value == null){
      newValue = element.likes
      map.set(element.author, element.likes)

    } else {
      newValue = element.likes + value
      map.set(element.author, newValue)           
    }

    if(newValue > bestValue){
      bestValue = newValue
      bestAuthor = element.author
    }

  })

  return {
    author: bestAuthor,
    likes: bestValue
  }
}

module.exports = {
  dummy,
  mostBlogs,
  totalLikes,
  favouritePost
}
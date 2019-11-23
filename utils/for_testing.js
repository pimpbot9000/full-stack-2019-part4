const palindrome = string => {
  return string
    .split('')
    .reverse()
    .join('')
}

const average = array => {
  const reducer = (sum, item) => {
    return sum + item
  }

  return array.length === 0 ? 0 : array.reduce(reducer, 0) / array.length
}

const mostBlogs = array => {
  let best = 0
  const authors = {}

  array.forEach(element => {
    console.log(authors[element])
  })

}

module.exports = {
  palindrome,
  average,
}
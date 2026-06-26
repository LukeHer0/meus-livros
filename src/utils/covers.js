/**
 * Gera placeholder de capa usando ui-avatars.
 */
export function generatePlaceholderCover(book) {
  const text = encodeURIComponent(book.title)
  return `https://ui-avatars.com/api/?name=${text}&size=300&background=2c3440&color=9ab&bold=true&font-size=0.4`
}

/**
 * Retorna a URL da capa do livro com fallback chain:
 * cover_url → OpenLibrary por ISBN → placeholder gerado.
 */
export function getCover(book) {
  if (book.cover_url?.trim()) return book.cover_url
  if (book.isbn) {
    const clean = book.isbn.replace('.0', '').trim()
    if (clean) return `https://covers.openlibrary.org/b/isbn/${clean}-L.jpg`
  }
  return generatePlaceholderCover(book)
}

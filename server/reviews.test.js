import { test } from 'node:test'
import assert from 'node:assert/strict'
import { mkdtemp, readFile, writeFile, rm } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { createServer } from 'node:http'
import { reviewMiddleware } from './reviews.js'

test('grava somente a resenha correta, preserva a coleção e detecta conflitos', async () => {
  const dir = await mkdtemp(join(tmpdir(), 'book-reviews-'))
  const initial = [{ title: 'Livro A', isbn: '123', pages: 123, review: null }, { title: 'Livro B', review: 'Original' }]
  await writeFile(join(dir, 'livros.json'), JSON.stringify(initial))
  await writeFile(join(dir, 'quadrinhos.json'), JSON.stringify(initial))
  const middleware = reviewMiddleware(dir)
  const server = createServer((req, res) => middleware(req, res, () => { res.writeHead(404); res.end() }))
  await new Promise(resolve => server.listen(0, '127.0.0.1', resolve))
  const base = `http://127.0.0.1:${server.address().port}`
  const request = data => fetch(`${base}/api/reviews`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) })
  const input = { collection: 'books', index: 0, title: 'Livro A', isbn: '123', previousReview: null, text: 'Ótimo!\n<texto literal>' }
  try {
    assert.equal((await request(input)).status, 200)
    const result = JSON.parse(await readFile(join(dir, 'livros.json'), 'utf8'))
    assert.equal(result[0].review, input.text)
    assert.equal(result[0].review_format, 'text')
    assert.equal(result[0].pages, 123)
    assert.deepEqual(result[1], initial[1])
    assert.deepEqual(JSON.parse(await readFile(join(dir, 'quadrinhos.json'), 'utf8')), initial)
    assert.equal((await request(input)).status, 409)
    assert.equal((await request({ ...input, title: 'Outro' })).status, 409)
    assert.equal((await request({ ...input, collection: '../livros' })).status, 400)
    assert.equal((await request({ ...input, text: ' ' })).status, 400)
    assert.equal((await request({ ...input, previousReview: input.text, text: 'Editada' })).status, 200)
    assert.equal((await (await fetch(`${base}/livros.json`)).json())[0].review, 'Editada')
    assert.equal((await request({ ...input, collection: 'comics' })).status, 200)
    const foreign = await fetch(`${base}/api/reviews`, { method: 'PUT', headers: { Origin: 'https://example.com', 'Content-Type': 'application/json' }, body: JSON.stringify(input) })
    assert.equal(foreign.status, 403)
  } finally {
    await new Promise(resolve => server.close(resolve))
    await rm(dir, { recursive: true, force: true })
  }
})

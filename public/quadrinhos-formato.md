# Cadastro de quadrinhos

Edite `quadrinhos.json`, uma lista independente de `livros.json`. Ela começa vazia (`[]`). Cada objeto representa uma edição ou volume lido. As páginas devem ser as da edição que você leu; não cadastre também suas edições individuais se já contou o encadernado.

Modelo de registro (substitua os valores antes de adicionar à lista):

```json
{
  "title": "Título do quadrinho",
  "author": "Nome do roteirista",
  "artist": "Nome do artista",
  "country": "Brasil",
  "original_language": "português",
  "format": "HQ",
  "year": null,
  "publisher": null,
  "pages": 0,
  "read_in": 2026,
  "rate": null,
  "review": null,
  "source": "Físico",
  "series_name": null,
  "series_number": null,
  "genre": [],
  "isbn": null,
  "cover_url": null
}
```

- `title`: título obrigatório. `author` e `artist`: texto; se houver várias pessoas, separe os nomes por vírgula.
- `format`: por exemplo `HQ`, `Mangá` ou `Graphic novel`.
- `pages`: número de páginas lidas dessa edição, inteiro não negativo; use `null` se desconhecido (não soma páginas).
- `read_in`: ano de leitura como número; `year`: ano de publicação. Use `null` quando desconhecido.
- `rate`: nota de 0,5 a 5 ou `null` se não avaliado.
- `series_name` e `series_number`: nome da série e número do volume (texto), ou `null`.
- `genre`: lista de gêneros. `isbn`: texto para preservar zeros à esquerda. `cover_url`: URL da capa ou `null`.
- Outros campos podem ser `null` quando desconhecidos. Não inclua comentários dentro do JSON.

A aba Quadrinhos mostra quantidade, leituras no ano atual, total de páginas e média por quadrinho cadastrado. Esses valores sempre consideram toda a coleção, mesmo durante a busca. A média divide as páginas pelo total de registros; páginas desconhecidas contam como zero. Nada é somado às estatísticas, autores, séries ou mapa dos livros. Os números do cabeçalho geral continuam se referindo aos livros.

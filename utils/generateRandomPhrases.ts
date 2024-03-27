export const generateMetadataContent = (countWords: number) => {
  const nouns = [
    'time',
    'person',
    'year',
    'way',
    'day',
    'thing',
    'man',
    'world',
    'life',
    'hand',
    'part',
    'child',
    'eye',
    'woman',
    'place',
    'work',
    'week',
    'case',
    'point',
    'government',
    'company',
    'number',
    'group',
    'problem',
    'fact',
  ]
  const adjectives = [
    'good',
    'new',
    'first',
    'last',
    'long',
    'great',
    'little',
    'own',
    'other',
    'old',
    'right',
    'big',
    'high',
    'different',
    'small',
    'large',
    'next',
    'early',
    'young',
    'important',
    'few',
    'public',
    'bad',
    'same',
    'able',
  ]

  const generatePhrase = (length: number) => {
    let words = []
    for (let i = 0; i < length; i++) {
      let word
      // Alternating between adjective and noun for simplicity
      if (i % 2 === 0) {
        word = adjectives[Math.floor(Math.random() * adjectives.length)]
      } else {
        word = nouns[Math.floor(Math.random() * nouns.length)]
      }
      words.push(word)
    }
    return words.join(' ')
  }

  const nameLength = Math.floor(countWords / 2)
  const descriptionLength = countWords - nameLength

  const name = generatePhrase(nameLength)
  const description = generatePhrase(descriptionLength)

  return {
    name: name,
    description: description,
  }
}

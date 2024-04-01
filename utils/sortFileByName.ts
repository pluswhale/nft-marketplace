import { File } from 'nft.storage'

export function sortFilesByName(files: File[]) {
  return files.sort((a, b) => {
    const nameA = a.name.replace(/^\D+/g, '')
    const nameB = b.name.replace(/^\D+/g, '')

    const numA = parseInt(nameA, 10)
    const numB = parseInt(nameB, 10)

    return numA - numB
  })
}

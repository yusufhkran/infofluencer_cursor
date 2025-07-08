// array.js: Dizi işlemleri için yardımcı fonksiyonlar.

/**
 * Dizi üzerinde çeşitli işlemler yapmak için yardımcı fonksiyonlar içerir.
 */

export function getTopN(arr, key, n = 10) {
  return (arr || [])
    .slice()
    .sort((a, b) => (b[key] || 0) - (a[key] || 0))
    .slice(0, n);
}

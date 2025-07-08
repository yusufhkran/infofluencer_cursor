// showMessage.js: Uygulama genelinde bilgi/uyarı mesajı göstermek için yardımcı fonksiyon.

/**
 * showMessage fonksiyonu, kullanıcıya toast veya alert mesajı gösterir.
 */
export function showMessage(setMessage, setMessageType, msg, type) {
  setMessage(msg);
  setMessageType(type);
  setTimeout(() => {
    setMessage("");
    setMessageType("");
  }, 5000);
}

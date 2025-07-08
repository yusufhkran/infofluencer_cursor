// Header.js: Infofluencer platformu için üst bilgi çubuğu

/**
 * Header componenti, sol üstte logo, sağ üstte kullanıcı bilgisi ve hızlı aksiyonları içerir.
 */
import React from 'react';

const Header = () => {
  return (
    <header className="header">
      <div className="logo">Infofluencer</div>
      <div className="user-info">Kullanıcı Adı {/* Kullanıcı avatarı ve menü burada olacak */}</div>
    </header>
  );
};

export default Header; 
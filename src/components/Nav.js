import React from 'react';
import { Link } from 'react-router-dom';

// Lightweight site nav between landing / build / play. Themed chrome arrives in
// fix_plan #39; for now this is a minimal, functional set of links.
function Nav() {
  return (
    <nav className="siteNav">
      <Link to="/">ホーム</Link>
      <Link to="/build">デッキ構築</Link>
      <Link to="/play">プレイ</Link>
    </nav>
  );
}

export default Nav;

import React from 'react';
import { Link } from 'react-router-dom';

// Minimal landing stub at "/". The full striking, dark-neon, image-free
// landing page (hero + how-it-works + ad slot) lands in fix_plan #40.
function Landing() {
  return (
    <main className="landing" data-testid="landing">
      <h1>デュエルマスターズ 一人回し用ツール</h1>
      <p>
        相手なし・ネットワークなし。アップロードしたカード画像でデッキを組み、一人でデッキの回り方を試せるプレイテスターです。
      </p>
      <Link className="button" to="/build">
        デッキを作る
      </Link>
    </main>
  );
}

export default Landing;

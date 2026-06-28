import React from 'react';
import { Link } from 'react-router-dom';
import './Landing.css';

// Landing page at "/". Responsive, Japanese, and intentionally image-free so it
// stays ad-safe (no uploaded/copyrighted card art) — see the Seam-2 test in
// Landing.test.js. Built on the dark-neon design tokens (src/theme.css).
function Landing() {
  return (
    <main className="landing" data-testid="landing">
      <section className="landingHero">
        <h1 className="landingTitle">デュエルマスターズ 一人回し用ツール</h1>
        <p className="landingTagline">
          ブラウザだけで動く、相手のいないデッキ回しツール。アップロードしたカードでデッキを組み、一人でデッキの回り方をじっくり試せます。
        </p>
        <div className="landingCtaRow">
          <Link className="landingCta landingCtaPrimary" to="/build">
            デッキを作る
          </Link>
          <Link className="landingCta landingCtaSecondary" to="/play">
            プレイ画面へ
          </Link>
        </div>
      </section>

      <section className="landingSection">
        <h2 className="landingHeading">これは何？</h2>
        <p className="landingBody">
          デュエルマスターズの「一人回し（ソリティア）」専用のプレイテスターです。相手もネットワークもありません。すべてブラウザの中だけで完結し、カード画像はあなたの端末から外に出ません。新しいデッキの動きを確認したいとき、回し方を練習したいときに使えます。
        </p>
      </section>

      <section className="landingSection">
        <h2 className="landingHeading">使い方</h2>
        <ol className="landingSteps">
          <li className="landingStep">
            <span className="landingStepNum">1</span>
            <div className="landingStepText">
              <span className="landingStepTitle">カード画像をアップロード</span>
              <span className="landingStepDesc">
                高画質のカード写真（公式カード検索の画像推奨）を読み込みます。
              </span>
            </div>
          </li>
          <li className="landingStep">
            <span className="landingStepNum">2</span>
            <div className="landingStepText">
              <span className="landingStepTitle">デッキを組む</span>
              <span className="landingStepDesc">各カードを1〜4枚指定してデッキを確定します。</span>
            </div>
          </li>
          <li className="landingStep">
            <span className="landingStepNum">3</span>
            <div className="landingStepText">
              <span className="landingStepTitle">ボードで一人回し</span>
              <span className="landingStepDesc">
                手札・マナ・シールド・バトルゾーンを自由に操作して試します。
              </span>
            </div>
          </li>
        </ol>
      </section>

      {/* Reserved ad slot — wired to AdSense on safe pages later (fix_plan #44).
          Kept image-free; ships dark until configured. */}
      <aside className="adSlot" data-testid="ad-slot" aria-label="広告スペース">
        広告スペース
      </aside>

      <section className="landingSection landingFinalCta">
        <Link className="landingCta landingCtaPrimary" to="/build">
          今すぐデッキを作る
        </Link>
      </section>
    </main>
  );
}

export default Landing;

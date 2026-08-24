import React from 'react';
import { Link } from 'react-router-dom';
import './Landing.css';
import AdSlot from '../components/AdSlot';

// Landing page at "/". Responsive, Japanese, and intentionally image-free so it
// stays ad-safe (no uploaded/copyrighted card art) — see the Seam-2 test in
// Landing.test.js. Built on the dark-neon design tokens (src/theme.css).
function Landing() {
  return (
    <main className="landing" data-testid="landing">
      <section className="landingHero">
        <h1 className="landingTitle">デュエルマスターズ 一人回し用ツール</h1>
        <p className="landingTagline">
          カード画像をアップロードしてデッキを組み、一人回しができるツール
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
        <h2 className="landingHeading">使い方</h2>
        <ol className="landingSteps">
          <li className="landingStep">
            <span className="landingStepNum">1</span>
            <div className="landingStepText">
              <span className="landingStepTitle">カード画像をアップロード</span>
              <span className="landingStepDesc">
                公式カード検索の画像をアップロードします。フォルダにカード画像のみのデッキを事前に組んでおくことをおすすめします（40枚）。
              </span>
            </div>
          </li>
          <li className="landingStep">
            <span className="landingStepNum">2</span>
            <div className="landingStepText">
              <span className="landingStepTitle">デッキを組む</span>
              <span className="landingStepDesc">
                各カードの枚数を1〜4枚で指定します。事前にフォルダに40枚の画像がある場合、そのままで確定して大丈夫です。
              </span>
            </div>
          </li>
          <li className="landingStep">
            <span className="landingStepNum">3</span>
            <div className="landingStepText">
              <span className="landingStepTitle">一人回し</span>
              <span className="landingStepDesc">
                手札、マナ、シールド、バトルゾーンを自由に操作することができます。
              </span>
            </div>
          </li>
        </ol>
      </section>

      {/* Reserved ad slot — wired to AdSense on safe pages later (fix_plan #44).
          Kept image-free; ships dark until configured. */}
      <aside className="adSlot" data-testid="ad-slot" aria-label="広告スペース">
        <AdSlot />
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

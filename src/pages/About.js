import React from 'react';
import { Link } from 'react-router-dom';
import './content.css';
import AdSlot from '../components/AdSlot';

// About / how-to-use guide at "/about". Responsive, Japanese, image-free
// (ad-safe — see contentPages.test.js, Seam 2). Built on the dark-neon tokens.
function About() {
  return (
    <main className="contentPage" data-testid="about">
      <h1 className="contentTitle">使い方・このツールについて</h1>

      <section className="contentSection">
        <h2 className="contentHeading">1. カード画像をアップロード</h2>
        <p className="contentBody">
          デッキ構築画面でファイルを選び、使いたいカードの画像を読み込みます。高画質の写真（デュエルマスターズ公式カード検索から保存した画像を推奨）を使うと、ボード上でも見やすくなります。画像はあなたの端末のブラウザ内だけで扱われ、サーバーには送信されません。
        </p>
      </section>

      <section className="contentSection">
        <h2 className="contentHeading">2. デッキを組む</h2>
        <p className="contentBody">
          読み込んだ各カードの枚数を1〜4枚で指定し、「デッキ確定」を押すとプレイ画面に移動します。やり直したいときは「リセット」で最初からやり直せます。
        </p>
      </section>

      <section className="contentSection">
        <h2 className="contentHeading">3. ボードで遊ぶ</h2>
        <p className="contentBody">
          手札・マナ・シールド・バトルゾーン・墓地・山札の各ゾーンをドラッグ＆ドロップで自由に動かせます。カードはタップ／アンタップ、表裏の反転、重ね置き、山札のシャッフルなどが行えます。次のキーボードショートカットも使えます。
        </p>
        <ul className="contentList">
          <li>
            <span className="contentKbd">Space</span>：カードを反転する
          </li>
          <li>
            <span className="contentKbd">Esc</span>：選択を解除する
          </li>
          <li>
            <span className="contentKbd">M</span>：カードを拡大表示する
          </li>
          <li>
            <span className="contentKbd">O</span>：カードを重ねる
          </li>
          <li>
            <span className="contentKbd">R</span>：すべてアンタップする
          </li>
          <li>
            <span className="contentKbd">T</span>：タップする
          </li>
        </ul>
      </section>

      <section className="contentSection">
        <h2 className="contentHeading">ご注意</h2>
        <p className="contentBody">
          これはルールエンジンではなく、デッキの動きを確かめるための練習ツールです。デスクトップでの利用を想定しています。ページを再読み込みすると、読み込んだカードとデッキはリセットされます。
        </p>
      </section>

      {/* Reserved ad slot — wired to AdSense later (fix_plan #44); stays image-free. */}
      <aside className="adSlot" data-testid="ad-slot" aria-label="広告スペース">
        <AdSlot />
      </aside>

      <div className="contentCtaRow">
        <Link className="contentCta" to="/build">
          デッキを作る
        </Link>
      </div>
    </main>
  );
}

export default About;

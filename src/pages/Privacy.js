import React from 'react';
import { Link } from 'react-router-dom';
import './content.css';

// Privacy policy at "/privacy". Responsive, Japanese, image-free (ad-safe — see
// contentPages.test.js, Seam 2). Covers cookies + third-party (AdSense) ads.
function Privacy() {
  return (
    <main className="contentPage" data-testid="privacy">
      <h1 className="contentTitle">プライバシーポリシー</h1>

      <section className="contentSection">
        <h2 className="contentHeading">取得する情報について</h2>
        <p className="contentBody">
          当サイトは、利用者の氏名・住所・メールアドレスといった個人を特定できる情報を、こちらから入力を求めて収集することはありません。アップロードされたカード画像は、お使いのブラウザ内でのみ処理され、サーバーへ送信・保存されることはありません。
        </p>
      </section>

      <section className="contentSection">
        <h2 className="contentHeading">Cookie（クッキー）について</h2>
        <p className="contentBody">
          当サイトでは、利用状況の把握や広告配信のために、Cookie
          および類似の技術を使用することがあります。Cookie
          はブラウザの設定からいつでも無効化できます。無効化した場合でも、当サイトの基本的な機能はご利用いただけます。
        </p>
      </section>

      <section className="contentSection">
        <h2 className="contentHeading">第三者配信の広告サービスについて</h2>
        <p className="contentBody">
          当サイトでは、第三者配信の広告サービス（Google
          AdSense）を利用する場合があります。これらの広告配信事業者は、利用者の興味に応じた広告を表示するために
          Cookie を使用することがあります。Google による広告 Cookie
          の利用を無効にする方法や、第三者配信事業者の Cookie 利用については、Google
          の広告設定ページおよび各社のポリシーをご確認ください。
        </p>
      </section>

      <section className="contentSection">
        <h2 className="contentHeading">免責事項</h2>
        <p className="contentBody">
          当サイトはデュエルマスターズの非公式なファンツールであり、株式会社タカラトミーおよび関連企業とは一切関係がありません。カード画像の著作権は各権利者に帰属します。本ポリシーは予告なく変更されることがあります。
        </p>
      </section>

      {/* Reserved ad slot — wired to AdSense later (fix_plan #44); stays image-free. */}
      <aside className="adSlot" data-testid="ad-slot" aria-label="広告スペース">
        広告スペース
      </aside>

      <div className="contentCtaRow">
        <Link className="contentCta" to="/">
          ホームへ戻る
        </Link>
      </div>
    </main>
  );
}

export default Privacy;

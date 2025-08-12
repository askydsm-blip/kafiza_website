import Document, { Html, Head, Main, NextScript } from "next/document";

export default class MyDocument extends Document {
  render() {
    return (
      <Html>
        <Head>
          {/* rel="me" helps some social verifications / identity tools */}
          <link rel="me" href="https://x.com/kafiza_net" />
          <link rel="me" href="https://www.instagram.com/kafiza_net" />
          <link rel="me" href="https://www.linkedin.com/kafiza" />

          {/* Basic social meta hints */}
          <meta property="og:site_name" content="Kafiza" />
          <meta name="twitter:site" content="@kafiza_net" />
        </Head>
        <body>
          <Main />
          <NextScript />
        </body>
      </Html>
    );
  }
}

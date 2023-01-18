import { FC } from "react";
import { DocumentProps, Html, Head, Main, NextScript } from "next/document";

const BPSDocument: FC<DocumentProps> = () => {
  return (
    <Html
      lang="en"
      className="h-full"
      style={{
        backgroundImage:
          "repeating-linear-gradient(white 0px, white 24px, #00000022 25px)",
      }}
    >
      <Head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="crossorigin"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Neucha&display=swap"
          rel="stylesheet"
        />
      </Head>
      <body className="h-full">
        <Main />
        <NextScript />
      </body>
    </Html>
  );
};

export default BPSDocument;

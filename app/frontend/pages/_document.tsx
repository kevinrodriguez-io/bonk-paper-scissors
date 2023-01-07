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
      <Head />
      <body className="h-full">
        <Main />
        <NextScript />
      </body>
    </Html>
  );
};

export default BPSDocument;

import { FC } from "react";
import { DocumentProps, Html, Head, Main, NextScript } from "next/document";

const BPSDocument: FC<DocumentProps> = () => {
  return (
    <Html lang="en" className="h-full bg-gray-100">
      <Head />
      <body className="h-full">
        <Main />
        <NextScript />
      </body>
    </Html>
  );
};

export default BPSDocument;

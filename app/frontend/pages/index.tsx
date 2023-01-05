import type { NextPage } from "next";
import Head from "next/head";

import { Layout } from "../components/Layout";

const Home: NextPage = () => {
  return (
    <>
      <Head>
        <title>BPS App</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <Layout title="Layout">
        <div className="py-4">
          <p className="text-4xl">Hello World</p>
        </div>
      </Layout>
    </>
  );
};

export default Home;

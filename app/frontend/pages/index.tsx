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
      <Layout title="Lobby">
        <div className="py-4">
          <h1 className="text-2xl font-semibold tracking-wide mt-1 mb-6">
            Welcome to BPS App
          </h1>
        </div>
      </Layout>
    </>
  );
};

export default Home;

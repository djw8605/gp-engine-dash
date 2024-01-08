import Head from 'next/head';
import Image from 'next/image';
//import styles from './layout.module.css';
//import utilStyles from '../styles/utils.module.css';
import Link from 'next/link';
import Footer from './footer';

export default function Layout({
  children,
  home,
}: {
  children: React.ReactNode;
  home?: boolean;
}) {
  function expandMobileMenu() {
    document.getElementById("mobile-menu")?.classList.toggle("hidden");
  }
  return (
    <div>
      <Head>
        <link rel="icon" href="/favicon.ico" />
        <meta
          name="description"
          content="Great Plains Extended Network of GPUs for Interactive Experimenters"
        />
        <meta
          property="og:image"
          content={`https://gp-engine.org/images/gp-engine-logo.png`}
        />
        <meta name="og:title" content="GP-ENGINE" />
        <meta name="twitter:card" content="summary_large_image" />
      </Head>
      <div className="">
        <nav className="py-5 bg-green-900">
          <div className="container flex flex-wrap justify-between items-center mx-auto p-1">
            <a href="/" className="flex items-center">
              <span className="self-center text-xl font-semibold whitespace-nowrap text-white">GP-ENGINE</span>
            </a>
            <button onClick={expandMobileMenu} data-collapse-toggle="mobile-menu" type="button" className="inline-flex items-center p-2 ml-3 text-sm text-gray-500 rounded-lg md:hidden focus:outline-none" aria-controls="mobile-menu-2" aria-expanded="false">
              <span className="sr-only">Open main menu</span>
              <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path fill-rule="evenodd" d="M3 5a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM3 10a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM3 15a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clip-rule="evenodd"></path></svg>
            </button>
            <div className="hidden w-full md:block md:w-auto" id="mobile-menu">
              <ul className="flex flex-col mt-4 md:flex-row md:space-x-8 md:mt-0 md:text-sm md:font-medium">
                <li>
                  <Link href="/about" className="block mt-4 lg:inline-block lg:mt-0 text-white link-underline mr-4 active:font-bold">
                    About
                  </Link>
                </li>
                <li>
                  <a href="https://docs.gp-engine.org" className="block mt-4 lg:inline-block lg:mt-0 text-white link-underline mr-4">
                    Docs
                  </a>
                </li>
              </ul>
            </div>
          </div>
        </nav>
        <main>{children}</main>
        <Footer />
      </div>
    </div>
  );
}

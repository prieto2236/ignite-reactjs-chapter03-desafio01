import Link from 'next/link';
import header from './header.module.scss';

export default function Header(): JSX.Element {
  return (
    <header className={header.headerContainer}>
      <Link href="/">
        <a>
          <img src="/images/Logo.svg" alt="logo" />
        </a>
      </Link>
    </header>
  );
}
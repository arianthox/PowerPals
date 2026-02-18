import { useUiStore, type Page } from '@/stores/uiStore';

const pages: Page[] = ['dashboard', 'accounts', 'settings'];

export function Nav() {
  const page = useUiStore((s) => s.page);
  const setPage = useUiStore((s) => s.setPage);

  return (
    <nav className="nav">
      {pages.map((p) => (
        <button
          key={p}
          className={page === p ? 'nav__btn nav__btn--active' : 'nav__btn'}
          onClick={() => setPage(p)}
          type="button"
        >
          {p}
        </button>
      ))}
    </nav>
  );
}

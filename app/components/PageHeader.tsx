import Link from 'next/link'
import styles from './PageHeader.module.css'

export interface PageHeaderLink {
  href: string
  label: string
}

interface PageHeaderProps {
  title: string
  subtitle: string
  links: PageHeaderLink[]
}

export function PageHeader({ title, subtitle, links }: PageHeaderProps) {
  return (
    <header className={styles.header}>
      <div className={styles.headerInner}>
        <h1 className={styles.title}>{title}</h1>
        <p className={styles.subtitle}>{subtitle}</p>
      </div>
      <nav className={styles.nav} aria-label="Navegação">
        {links.map(({ href, label }) => (
          <Link key={href + label} href={href} className={styles.link}>
            {label}
          </Link>
        ))}
      </nav>
    </header>
  )
}

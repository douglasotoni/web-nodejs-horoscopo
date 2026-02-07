import { redirect } from 'next/navigation'

/**
 * Raiz do site: redireciona para /api (documentação e base dos endpoints).
 */
export default function Home() {
  redirect('/api')
}

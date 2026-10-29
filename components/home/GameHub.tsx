'use client'

import Link from 'next/link'
import { useEffect, useRef, useState, useSyncExternalStore } from 'react'
import { ArrowRight, Clock3, Gamepad2, Heart, Moon, Search, Sun, X } from 'lucide-react'
import { useGameTheme } from '@/components/GameThemeProvider'
import { GAME_BY_ID, GAME_CATALOG, GAME_CATEGORIES, filterGames, type GameCategory } from '@/lib/gameCatalog'
import { FAVORITES_KEY, RECENT_GAMES_KEY, getHubSnapshot, readGameIds, subscribeToHub, toggleFavorite } from '@/lib/gameHubStorage'
import styles from './GameHub.module.css'

const emptySnapshot = () => '[]'
const getFavorites = () => getHubSnapshot(FAVORITES_KEY)
const getRecentGames = () => getHubSnapshot(RECENT_GAMES_KEY)
const getDesktop = () => window.matchMedia('(min-width: 768px)').matches &&
  !/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) &&
  !(navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1)
const subscribeToDesktop = (listener: () => void) => {
  const media = window.matchMedia('(min-width: 768px)')
  media.addEventListener('change', listener)
  return () => media.removeEventListener('change', listener)
}
const previewTiles = [2, 0, 0, 0, 4, 8, 0, 0, 8, 32, 64, 0, 16, 64, 128, 256]

export function GameHub() {
  const { theme, toggleTheme } = useGameTheme()
  const favorites = readGameIds(useSyncExternalStore(subscribeToHub, getFavorites, emptySnapshot))
  const recent = readGameIds(useSyncExternalStore(subscribeToHub, getRecentGames, emptySnapshot))
  const desktop = useSyncExternalStore(subscribeToDesktop, getDesktop, () => true)
  const visibleRecent = recent.filter(id => desktop || !GAME_BY_ID.get(id)?.desktopOnly)
  const [category, setCategory] = useState<GameCategory>('all')
  const [query, setQuery] = useState('')
  const [favoritesOnly, setFavoritesOnly] = useState(false)
  const searchRef = useRef<HTMLInputElement>(null)
  const games = filterGames(category, query, favoritesOnly ? favorites : undefined)

  useEffect(() => {
    const handleKey = (event: KeyboardEvent) => {
      const target = event.target
      if (event.key !== '/' || event.ctrlKey || event.metaKey || event.altKey ||
        (target instanceof HTMLElement && (target.isContentEditable || target.closest('input, textarea, select, [role="dialog"]')))) return
      event.preventDefault()
      searchRef.current?.focus()
    }
    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [])

  useEffect(() => {
    if (process.env.NODE_ENV !== 'development') return
    const target = window as Window & { render_game_to_text?: () => string }
    const render = () => JSON.stringify({ mode: 'game-hub', category, query, favoritesOnly, games: games.map(game => game.id), favorites, recent })
    Object.defineProperty(target, 'render_game_to_text', { configurable: true, value: render })
    return () => { if (target.render_game_to_text === render) Reflect.deleteProperty(target, 'render_game_to_text') }
  }, [category, query, favoritesOnly, games, favorites, recent])

  const resetFilters = () => { setQuery(''); setCategory('all'); setFavoritesOnly(false) }

  return (
    <main className={styles.hub}>
      <div className={styles.container}>
        <header className={styles.header}>
          <div className={styles.brand}>
            <span className={styles.brandIcon}><Gamepad2 size={25} aria-hidden="true" /></span>
            <span><strong>DogeOW</strong><span className={styles.brandSubtitle}>游戏中心</span></span>
          </div>
          <div className={styles.headerActions}>
            <span className={styles.gameCount}>{GAME_CATALOG.length} 款游戏 · 随时开玩</span>
            <button className={styles.themeButton} onClick={toggleTheme} type="button" aria-label={theme === 'dark' ? '切换到浅色模式' : '切换到深色模式'}>
              {theme === 'dark' ? <Sun size={19} /> : <Moon size={19} />}
            </button>
          </div>
        </header>

        <section className={styles.hero} aria-labelledby="hub-heading">
          <div className={styles.heroCopy}>
            <span className={styles.eyebrow}><span /> 给自己一点游玩时间</span>
            <h1 id="hub-heading">快乐，<br />从这一局开始<span>。</span></h1>
            <p>动动脑，试试手气，或挑战自己的纪录。<br className={styles.desktopBreak} />找到喜欢的游戏，让空闲变得有趣。</p>
            <a className={styles.browseButton} href="#game-library">挑一个游戏 <ArrowRight size={17} aria-hidden="true" /></a>
            <div className={styles.heroMeta}><span>益智解谜</span><i />经典街机<i /><span>棋盘桌游</span></div>
          </div>
          <Link href="/2048" prefetch={false} className={styles.featured} aria-label="开始游玩 2048">
            <div className={styles.featuredTop}><span>从经典开始</span><ArrowRight size={21} aria-hidden="true" /></div>
            <div className={styles.tilePreview} aria-hidden="true">{previewTiles.map((tile, index) => <span key={index} data-value={tile}>{tile || ''}</span>)}</div>
            <div className={styles.featuredBottom}><div><strong>2048</strong><p>小小的棋盘，大大的可能。</p></div><span className={styles.playCircle}><ArrowRight size={21} aria-hidden="true" /></span></div>
          </Link>
        </section>

        {visibleRecent.length > 0 && (
          <nav className={styles.recent} aria-label="最近游玩">
            <span><Clock3 size={15} aria-hidden="true" /> 最近游玩</span>
            {visibleRecent.map(id => {
              const game = GAME_BY_ID.get(id)!
              return <Link href={`/${id}`} prefetch={false} key={id}><span aria-hidden="true">{game.icon}</span>{game.name}<ArrowRight size={13} aria-hidden="true" /></Link>
            })}
          </nav>
        )}

        <section id="game-library" className={styles.library} aria-labelledby="library-heading">
          <div className={styles.libraryTop}>
            <div><span className={styles.sectionEyebrow}>FIND YOUR NEXT GAME</span><h2 id="library-heading">今天想玩什么？</h2></div>
            <div className={styles.search}>
              <Search size={18} aria-hidden="true" />
              <input ref={searchRef} type="search" aria-label="搜索游戏" placeholder="搜索游戏…" value={query} onChange={event => setQuery(event.target.value)} />
              {query ? <button type="button" onClick={() => { setQuery(''); searchRef.current?.focus() }} aria-label="清空搜索"><X size={16} /></button> : <kbd aria-hidden="true">/</kbd>}
            </div>
          </div>
          <div className={styles.filters}>
            <div className={styles.categories} aria-label="游戏分类">
              {GAME_CATEGORIES.map(item => <button type="button" key={item.id} aria-pressed={category === item.id} onClick={() => setCategory(item.id)}>{item.name}{item.id === 'all' && <span>{GAME_CATALOG.length}</span>}</button>)}
            </div>
            <button className={styles.favoritesFilter} type="button" aria-pressed={favoritesOnly} onClick={() => setFavoritesOnly(value => !value)}><Heart size={15} aria-hidden="true" />我的收藏<span>{favorites.length}</span></button>
          </div>
          <p className={styles.resultCount} role="status">{favoritesOnly ? '收藏中' : '游戏库'} · {games.length} 款游戏</p>
          <ul className={styles.grid} aria-label="游戏列表">
            {games.map(game => {
              const favorite = favorites.includes(game.id)
              const unavailable = game.desktopOnly && !desktop
              const content = <><div className={styles.cardArtwork} data-color={game.color}><span aria-hidden="true">{game.icon}</span><span className={styles.artworkPattern} aria-hidden="true" /></div><div className={styles.cardCopy}><div className={styles.cardTitle}><h3>{game.name}</h3>{!unavailable && <ArrowRight size={17} aria-hidden="true" />}</div><p>{game.description}</p><span className={styles.controls}>{unavailable ? '请在电脑上使用键盘和鼠标游玩' : game.controls}{game.desktopOnly && !unavailable && ' · 电脑专属'}</span></div></>
              return <li key={game.id} className={styles.card} data-unavailable={unavailable || undefined}>
                {unavailable ? <div className={styles.cardLink}>{content}</div> : <Link className={styles.cardLink} href={`/${game.id}`} prefetch={false} aria-label={`游玩 ${game.name}`}>{content}</Link>}
                <button className={styles.favoriteButton} type="button" aria-label={`${favorite ? '取消收藏' : '收藏'} ${game.name}`} aria-pressed={favorite} onClick={() => toggleFavorite(game.id)}><Heart size={17} fill={favorite ? 'currentColor' : 'none'} aria-hidden="true" /></button>
              </li>
            })}
          </ul>
          {games.length === 0 && <div className={styles.empty}><Search size={27} aria-hidden="true" /><h3>{favoritesOnly && !favorites.length ? '把喜欢的游戏留在这里' : '还没有找到合适的游戏'}</h3><p>{favoritesOnly && !favorites.length ? '点击游戏卡片上的爱心，下次更快开始。' : '试试其他关键词，或换一个分类。'}</p><button type="button" onClick={resetFilters}>查看全部游戏 <ArrowRight size={15} aria-hidden="true" /></button></div>}
        </section>
        <footer className={styles.footer}><span><Gamepad2 size={17} aria-hidden="true" /> DogeOW 游戏中心</span><span>玩得开心，也记得休息。</span></footer>
      </div>
    </main>
  )
}

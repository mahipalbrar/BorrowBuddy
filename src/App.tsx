import { useEffect, useMemo, useState } from 'react'
import type { FormEvent } from 'react'
import {
  ArrowRight,
  Bell,
  BookOpen,
  Box,
  CalendarDays,
  Check,
  ChevronDown,
  Clock3,
  Copy,
  Edit3,
  Heart,
  Laptop,
  ListFilter,
  Menu,
  PackageOpen,
  Plus,
  Search,
  ShieldCheck,
  Sparkles,
  Trash2,
  Umbrella,
  X,
  Zap,
} from 'lucide-react'
import './App.css'

type Category =
  | 'Electronics'
  | 'Books'
  | 'Stationery'
  | 'Lab Equipment'
  | 'Sports'
  | 'Daily Essentials'
type Status = 'pending' | 'approved' | 'rejected' | 'returned'

type Item = {
  id: string
  name: string
  category: Category
  description: string
  condition: string
  owner: string
  duration: string
  available: boolean
  featured?: boolean
  icon: string
  color: string
}

type Request = {
  id: string
  itemId: string
  borrower: string
  startDate: string
  returnDate: string
  message: string
  status: Status
}

const CURRENT_USER = 'Maya Singh'
const categories: Array<Category | 'All items'> = [
  'All items',
  'Electronics',
  'Books',
  'Stationery',
  'Lab Equipment',
  'Sports',
  'Daily Essentials',
]

const seedItems: Item[] = [
  { id: 'item-1', name: 'Scientific Calculator', category: 'Electronics', description: 'Casio fx-991EX ClassWiz with a clear display and all the functions you need for engineering maths.', condition: 'Like new', owner: 'Maya Singh', duration: 'Up to 7 days', available: true, featured: true, icon: 'calculator', color: 'lavender' },
  { id: 'item-2', name: 'Engineering Drawing Kit', category: 'Stationery', description: 'Complete geometry and drawing kit with compass, set squares, divider and mechanical pencil.', condition: 'Good', owner: 'Arjun Mehta', duration: 'Up to 5 days', available: true, featured: true, icon: 'ruler', color: 'peach' },
  { id: 'item-3', name: 'Lab Coat', category: 'Lab Equipment', description: 'Clean, white cotton lab coat. Size M, comfortable fit with two front pockets.', condition: 'Excellent', owner: 'Riya Kapoor', duration: 'Up to 3 days', available: true, icon: 'lab', color: 'mint' },
  { id: 'item-4', name: 'USB-C Fast Charger', category: 'Electronics', description: '65W GaN fast charger with a 1.5m braided USB-C cable. Works with most laptops and phones.', condition: 'Like new', owner: 'Kabir Shah', duration: 'Up to 7 days', available: true, featured: true, icon: 'charger', color: 'sky' },
  { id: 'item-5', name: 'Badminton Racket', category: 'Sports', description: 'Lightweight Yonex racket, recently restrung and ready for your next game at the court.', condition: 'Good', owner: 'Maya Singh', duration: 'Up to 2 days', available: true, icon: 'racket', color: 'yellow' },
  { id: 'item-6', name: 'Compact Umbrella', category: 'Daily Essentials', description: 'Windproof, compact umbrella that fits easily inside your backpack.', condition: 'Good', owner: 'Dev Patel', duration: 'Up to 5 days', available: true, icon: 'umbrella', color: 'blue' },
  { id: 'item-7', name: 'University Physics Vol. 1', category: 'Books', description: 'Young & Freedman, 15th edition. Lightly annotated in pencil with useful chapter tabs.', condition: 'Good', owner: 'Ananya Rao', duration: 'Up to 14 days', available: true, featured: true, icon: 'book', color: 'rose' },
  { id: 'item-8', name: 'Power Bank 20,000mAh', category: 'Electronics', description: 'Reliable power bank with dual USB output and a battery indicator. Cable included.', condition: 'Excellent', owner: 'Maya Singh', duration: 'Up to 4 days', available: true, icon: 'power', color: 'orange' },
  { id: 'item-9', name: 'Geometry Box', category: 'Stationery', description: 'Classmate geometry box with sharp compass, ruler, protractor and extra leads.', condition: 'Good', owner: 'Vikram Joshi', duration: 'Up to 7 days', available: true, icon: 'geometry', color: 'teal' },
  { id: 'item-10', name: 'Laptop Stand', category: 'Daily Essentials', description: 'Foldable aluminium laptop stand with six height levels for a more comfortable study setup.', condition: 'Like new', owner: 'Neha Verma', duration: 'Up to 30 days', available: true, icon: 'laptop', color: 'indigo' },
]

const seedRequests: Request[] = [
  { id: 'req-1', itemId: 'item-1', borrower: 'Ishaan Gupta', startDate: '2026-11-14', returnDate: '2026-11-17', message: 'I have an end-sem maths quiz coming up. I will take good care of it!', status: 'pending' },
  { id: 'req-2', itemId: 'item-3', borrower: 'Maya Singh', startDate: '2026-11-12', returnDate: '2026-11-14', message: 'Need it for my chemistry practical.', status: 'approved' },
]

const getStored = <T,>(key: string, fallback: T): T => {
  try {
    const stored = localStorage.getItem(key)
    return stored ? JSON.parse(stored) as T : fallback
  } catch {
    return fallback
  }
}

function ItemIcon({ type }: { type: string }) {
  const props = { size: 31, strokeWidth: 1.7 }
  if (type === 'book') return <BookOpen {...props} />
  if (type === 'umbrella') return <Umbrella {...props} />
  if (type === 'laptop') return <Laptop {...props} />
  if (type === 'power' || type === 'charger') return <Zap {...props} />
  if (type === 'lab') return <ShieldCheck {...props} />
  return <Box {...props} />
}

function App() {
  const [items, setItems] = useState<Item[]>(() => getStored('borrowbuddy-items', seedItems))
  const [requests, setRequests] = useState<Request[]>(() => getStored('borrowbuddy-requests', seedRequests))
  const [activeTab, setActiveTab] = useState<'explore' | 'list' | 'listings' | 'borrowings'>('explore')
  const [category, setCategory] = useState('All items')
  const [query, setQuery] = useState('')
  const [selectedItem, setSelectedItem] = useState<Item | null>(null)
  const [toast, setToast] = useState<{ type: 'success' | 'error'; text: string } | null>(null)
  const [editingItem, setEditingItem] = useState<Item | null>(null)
  const [mobileNav, setMobileNav] = useState(false)
  const [showCategory, setShowCategory] = useState(false)

  useEffect(() => localStorage.setItem('borrowbuddy-items', JSON.stringify(items)), [items])
  useEffect(() => localStorage.setItem('borrowbuddy-requests', JSON.stringify(requests)), [requests])
  useEffect(() => {
    if (!toast) return
    const timer = window.setTimeout(() => setToast(null), 3200)
    return () => window.clearTimeout(timer)
  }, [toast])

  const myListings = items.filter((item) => item.owner === CURRENT_USER)
  const incomingRequests = requests.filter((request) => {
    const item = items.find((candidate) => candidate.id === request.itemId)
    return item?.owner === CURRENT_USER
  })
  const myBorrowings = requests.filter((request) => request.borrower === CURRENT_USER)
  const pendingIncoming = incomingRequests.filter((request) => request.status === 'pending').length
  const filteredItems = useMemo(() => items.filter((item) => {
    const matchesCategory = category === 'All items' || item.category === category
    const matchesQuery = item.name.toLowerCase().includes(query.toLowerCase()) || item.description.toLowerCase().includes(query.toLowerCase())
    return matchesCategory && matchesQuery
  }), [category, items, query])
  const featuredItems = items.filter((item) => item.featured).slice(0, 4)

  const notify = (text: string, type: 'success' | 'error' = 'success') => setToast({ text, type })
  const goTo = (tab: typeof activeTab) => {
    setActiveTab(tab)
    setMobileNav(false)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const handleRequest = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!selectedItem) return
    const data = new FormData(event.currentTarget)
    const alreadyRequested = requests.some((request) => request.itemId === selectedItem.id && request.borrower === CURRENT_USER && ['pending', 'approved'].includes(request.status))
    if (alreadyRequested) {
      notify('You already have an active request for this item.', 'error')
      return
    }
    const startDate = String(data.get('startDate'))
    const returnDate = String(data.get('returnDate'))
    if (returnDate < startDate) {
      notify('Return date must be on or after the start date.', 'error')
      return
    }
    setRequests((current) => [...current, {
      id: `req-${Date.now()}`,
      itemId: selectedItem.id,
      borrower: CURRENT_USER,
      startDate,
      returnDate,
      message: String(data.get('message') ?? ''),
      status: 'pending',
    }])
    setSelectedItem(null)
    notify('Request sent! The owner will review it shortly.')
  }

  const handleListing = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const data = new FormData(event.currentTarget)
    const currentIcon = editingItem?.icon ?? 'box'
    const currentColor = editingItem?.color ?? ['lavender', 'mint', 'peach', 'sky'][items.length % 4]
    const nextItem: Item = {
      id: editingItem?.id ?? `item-${Date.now()}`,
      name: String(data.get('name')),
      category: String(data.get('category')) as Category,
      description: String(data.get('description')),
      condition: String(data.get('condition')),
      owner: String(data.get('owner')),
      duration: String(data.get('duration')),
      available: editingItem?.available ?? true,
      icon: currentIcon,
      color: currentColor,
      featured: editingItem?.featured,
    }
    setItems((current) => editingItem ? current.map((item) => item.id === editingItem.id ? nextItem : item) : [nextItem, ...current])
    setEditingItem(null)
    notify(editingItem ? 'Listing updated successfully.' : 'Your item is now listed on BorrowBuddy.')
    goTo('listings')
  }

  const deleteListing = (id: string) => {
    setItems((current) => current.filter((item) => item.id !== id))
    setRequests((current) => current.filter((request) => request.itemId !== id))
    notify('Listing deleted.')
  }

  const updateRequest = (requestId: string, status: 'approved' | 'rejected') => {
    const request = requests.find((entry) => entry.id === requestId)
    if (!request) return
    setRequests((current) => current.map((entry) => {
      if (entry.id === requestId) return { ...entry, status }
      if (status === 'approved' && entry.itemId === request.itemId && entry.status === 'pending') return { ...entry, status: 'rejected' }
      return entry
    }))
    if (status === 'approved') {
      setItems((current) => current.map((item) => item.id === request.itemId ? { ...item, available: false } : item))
      notify('Request approved. This item is now marked unavailable.')
    } else notify('Request declined.')
  }

  const cancelRequest = (id: string) => {
    setRequests((current) => current.filter((request) => request.id !== id))
    notify('Borrowing request cancelled.')
  }

  const returnRequest = (id: string) => {
    const request = requests.find((entry) => entry.id === id)
    setRequests((current) => current.map((entry) => entry.id === id ? { ...entry, status: 'returned' } : entry))
    if (request) setItems((current) => current.map((item) => item.id === request.itemId ? { ...item, available: true } : item))
    notify('Thanks for returning the item!')
  }

  return (
    <div className="app-shell">
      <header className="topbar">
        <div className="topbar-inner">
          <button className="brand" onClick={() => goTo('explore')} aria-label="Go to BorrowBuddy home">
            <span className="brand-mark"><Copy size={18} /></span>
            <span>Borrow<span>Buddy</span></span>
          </button>
          <nav className={`main-nav ${mobileNav ? 'is-open' : ''}`}>
            <button className={activeTab === 'explore' ? 'active' : ''} onClick={() => goTo('explore')}>Explore</button>
            <button className={activeTab === 'list' ? 'active' : ''} onClick={() => goTo('list')}>List an item</button>
            <button className={activeTab === 'listings' ? 'active' : ''} onClick={() => goTo('listings')}>My listings {pendingIncoming > 0 && <span className="nav-badge">{pendingIncoming}</span>}</button>
            <button className={activeTab === 'borrowings' ? 'active' : ''} onClick={() => goTo('borrowings')}>My borrowings</button>
          </nav>
          <div className="profile-actions">
            <button className="icon-btn notification" aria-label="Notifications"><Bell size={19} /><span /></button>
            <button className="profile"><span className="avatar">MS</span><span className="profile-name">Maya Singh</span><ChevronDown size={15} /></button>
          </div>
          <button className="mobile-menu" onClick={() => setMobileNav((open) => !open)} aria-label="Toggle navigation"><Menu size={21} /></button>
        </div>
      </header>

      <main>
        {activeTab === 'explore' && <ExploreView
          query={query} setQuery={setQuery} category={category} setCategory={setCategory}
          showCategory={showCategory} setShowCategory={setShowCategory} featuredItems={featuredItems}
          filteredItems={filteredItems} onSelect={setSelectedItem} onList={() => goTo('list')}
        />}
        {activeTab === 'list' && <ListingForm editingItem={editingItem} onSubmit={handleListing} onCancel={() => { setEditingItem(null); goTo('listings') }} />}
        {activeTab === 'listings' && <MyListings items={myListings} requests={incomingRequests} onEdit={(item) => { setEditingItem(item); goTo('list') }} onDelete={deleteListing} onUpdateRequest={updateRequest} onList={() => goTo('list')} />}
        {activeTab === 'borrowings' && <MyBorrowings requests={myBorrowings} items={items} onCancel={cancelRequest} onReturn={returnRequest} onExplore={() => goTo('explore')} />}
      </main>

      {selectedItem && <RequestModal item={selectedItem} onClose={() => setSelectedItem(null)} onSubmit={handleRequest} />}
      {toast && <div className={`toast ${toast.type}`}><span className="toast-icon">{toast.type === 'success' ? <Check size={16} /> : <X size={16} />}</span>{toast.text}</div>}
      <footer><span>© 2026 BorrowBuddy</span><span>Built for campus communities <Heart size={13} fill="currentColor" /></span></footer>
    </div>
  )
}

function ExploreView({ query, setQuery, category, setCategory, showCategory, setShowCategory, featuredItems, filteredItems, onSelect, onList }: {
  query: string; setQuery: (value: string) => void; category: string; setCategory: (value: string) => void; showCategory: boolean; setShowCategory: (value: boolean) => void; featuredItems: Item[]; filteredItems: Item[]; onSelect: (item: Item) => void; onList: () => void
}) {
  return <div className="page explore-page">
    <section className="hero-section">
      <div className="hero-copy">
        <div className="eyebrow"><Sparkles size={14} /> CAMPUS COMMUNITY MARKETPLACE</div>
        <h1>Good things are<br /><em>better shared.</em></h1>
        <p>Find what you need from someone on campus.<br />Lend what you have and make a difference.</p>
        <div className="hero-actions"><button className="button primary" onClick={() => document.getElementById('all-items')?.scrollIntoView({ behavior: 'smooth' })}>Explore items <ArrowRight size={17} /></button><button className="text-button" onClick={onList}>List an item <Plus size={16} /></button></div>
      </div>
      <div className="hero-art">
        <div className="art-glow" /><div className="blob blob-one" /><div className="blob blob-two" />
        <div className="floating-card card-book"><BookOpen size={23} /><span><b>Physics textbook</b><small>Available now</small></span></div>
        <div className="floating-card card-calc"><Box size={22} /><span><b>Calculator</b><small>Like new · 2 days</small></span></div>
        <div className="hero-illustration"><div className="person-head" /><div className="person-body" /><div className="person-laptop"><Laptop size={39} /></div><div className="spark spark-a">✦</div><div className="spark spark-b">✦</div></div>
      </div>
    </section>
    <section className="stats-strip"><div><strong>120+</strong><span>Items shared</span></div><div><strong>48</strong><span>Active borrowers</span></div><div><strong>96%</strong><span>Happy handoffs</span></div><div className="stats-note"><ShieldCheck size={20} /><span><b>Safe &amp; student-only</b><small>Built around trust</small></span></div></section>
    <section className="section featured-section"><div className="section-heading"><div><p className="section-kicker">HANDPICKED FOR YOU</p><h2>Featured items</h2></div><button className="view-all" onClick={() => document.getElementById('all-items')?.scrollIntoView({ behavior: 'smooth' })}>View all items <ArrowRight size={16} /></button></div><div className="item-grid featured-grid">{featuredItems.map((item) => <ItemCard key={item.id} item={item} onSelect={onSelect} />)}</div></section>
    <section className="section all-section" id="all-items"><div className="section-heading all-heading"><div><p className="section-kicker">BROWSE THE COMMUNITY</p><h2>All items <span className="item-count">{filteredItems.length}</span></h2></div><div className="search-wrap"><Search size={17} /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search items..." /><button className="filter-button" onClick={() => setShowCategory(!showCategory)}><ListFilter size={16} /> <span>{category === 'All items' ? 'Filter' : category}</span><ChevronDown size={14} /></button>{showCategory && <div className="category-menu">{categories.map((entry) => <button key={entry} className={entry === category ? 'selected' : ''} onClick={() => { setCategory(entry); setShowCategory(false) }}>{entry}{entry === category && <Check size={14} />}</button>)}</div>}</div></div><div className="category-pills">{categories.map((entry) => <button key={entry} className={entry === category ? 'active' : ''} onClick={() => setCategory(entry)}>{entry}</button>)}</div>{filteredItems.length ? <div className="item-grid">{filteredItems.map((item) => <ItemCard key={item.id} item={item} onSelect={onSelect} />)}</div> : <EmptyState icon={<PackageOpen />} title="No items found" text="Try a different search or category." />}</section>
  </div>
}

function ItemCard({ item, onSelect }: { item: Item; onSelect: (item: Item) => void }) {
  return <article className="item-card"><div className={`item-visual ${item.color}`}><div className="visual-icon"><ItemIcon type={item.icon} /></div><button className="heart-button" aria-label="Save item"><Heart size={17} /></button>{item.featured && <span className="featured-label"><Sparkles size={12} /> Featured</span>}</div><div className="item-info"><div className="item-meta"><span className="item-category">{item.category}</span><span className="condition"><span className="dot" />{item.condition}</span></div><h3>{item.name}</h3><div className="owner-row"><span className="mini-avatar">{item.owner.split(' ').map((name) => name[0]).join('')}</span><span>{item.owner}</span><span className={`availability ${item.available ? '' : 'unavailable'}`}>{item.available ? 'Available' : 'On loan'}</span></div><button className="card-button" onClick={() => onSelect(item)} disabled={!item.available}>{item.available ? 'Borrow this item' : 'Currently unavailable'} <ArrowRight size={15} /></button></div></article>
}

function RequestModal({ item, onClose, onSubmit }: { item: Item; onClose: () => void; onSubmit: (event: FormEvent<HTMLFormElement>) => void }) {
  return <div className="modal-backdrop" onMouseDown={(event) => { if (event.target === event.currentTarget) onClose() }}><div className="modal"><div className={`modal-item-visual ${item.color}`}><ItemIcon type={item.icon} /></div><button className="modal-close" onClick={onClose} aria-label="Close"><X size={19} /></button><div className="modal-content"><div className="item-meta"><span className="item-category">{item.category}</span><span className="condition"><span className="dot" />{item.condition}</span></div><h2>Request {item.name}</h2><p className="modal-description">{item.description}</p><div className="modal-owner"><span className="mini-avatar">{item.owner.split(' ').map((name) => name[0]).join('')}</span><span>Listed by <b>{item.owner}</b></span><span className="duration"><Clock3 size={14} /> {item.duration}</span></div><form onSubmit={onSubmit} className="request-form"><div className="form-grid"><label>Borrower name<input name="borrower" value="Maya Singh" readOnly /></label><label>Start date<input name="startDate" type="date" required min={new Date().toISOString().split('T')[0]} /></label><label>Expected return date<input name="returnDate" type="date" required min={new Date().toISOString().split('T')[0]} /></label></div><label>Message <span className="optional">Optional</span><textarea name="message" rows={3} placeholder="Add a note for the owner..." /></label><button className="button primary full" type="submit">Send borrowing request <ArrowRight size={16} /></button></form></div></div></div>
}

function ListingForm({ editingItem, onSubmit, onCancel }: { editingItem: Item | null; onSubmit: (event: FormEvent<HTMLFormElement>) => void; onCancel: () => void }) {
  return <div className="page form-page"><div className="form-page-header"><div><p className="section-kicker">SHARE WITH YOUR COMMUNITY</p><h1>{editingItem ? 'Edit your listing' : 'List an item'}</h1><p>{editingItem ? 'Keep your listing details up to date.' : 'Have something useful sitting around? Someone on campus might need it.'}</p></div><div className="form-page-icon"><PackageOpen size={31} /></div></div><form className="listing-form" onSubmit={onSubmit}><div className="form-card"><div className="form-card-title"><span className="step-number">01</span><div><h2>Item details</h2><p>Tell your campus community about it.</p></div></div><div className="form-grid two-col"><label>Item name<input name="name" required defaultValue={editingItem?.name} placeholder="e.g. Scientific calculator" /></label><label>Category<select name="category" required defaultValue={editingItem?.category ?? 'Electronics'}>{categories.slice(1).map((entry) => <option key={entry}>{entry}</option>)}</select></label><label className="wide">Description<textarea name="description" rows={4} required defaultValue={editingItem?.description} placeholder="What should borrowers know about this item?" /></label></div></div><div className="form-card"><div className="form-card-title"><span className="step-number">02</span><div><h2>Condition &amp; availability</h2><p>Set expectations for a smooth handoff.</p></div></div><div className="form-grid three-col"><label>Condition<select name="condition" defaultValue={editingItem?.condition ?? 'Good'}><option>Like new</option><option>Excellent</option><option>Good</option><option>Well used</option></select></label><label>Lending duration<select name="duration" defaultValue={editingItem?.duration ?? 'Up to 7 days'}><option>Up to 2 days</option><option>Up to 5 days</option><option>Up to 7 days</option><option>Up to 14 days</option><option>Up to 30 days</option></select></label><label>Owner name<input name="owner" required defaultValue={editingItem?.owner ?? CURRENT_USER} /></label></div></div><div className="form-actions"><button type="button" className="button secondary" onClick={onCancel}>Cancel</button><button type="submit" className="button primary">{editingItem ? 'Save changes' : 'Publish listing'} <ArrowRight size={16} /></button></div></form></div>
}

function MyListings({ items, requests, onEdit, onDelete, onUpdateRequest, onList }: { items: Item[]; requests: Request[]; onEdit: (item: Item) => void; onDelete: (id: string) => void; onUpdateRequest: (id: string, status: 'approved' | 'rejected') => void; onList: () => void }) {
  return <div className="page dashboard-page"><div className="dashboard-header"><div><p className="section-kicker">YOUR SHARED ITEMS</p><h1>My listings</h1><p>Manage your items and keep lending moving.</p></div><button className="button primary" onClick={onList}><Plus size={17} /> List an item</button></div><div className="dashboard-stats"><Stat icon={<Box />} number={items.length} label="Total listings" /><Stat icon={<Check />} number={items.filter((item) => item.available).length} label="Available now" /><Stat icon={<Clock3 />} number={requests.filter((request) => request.status === 'pending').length} label="Awaiting review" /></div><div className="dashboard-columns"><section className="dashboard-panel"><div className="panel-heading"><div><h2>Your items</h2><p>Items you have shared with campus</p></div><span className="panel-count">{items.length}</span></div>{items.length ? items.map((item) => <div className="listing-row" key={item.id}><div className={`row-icon ${item.color}`}><ItemIcon type={item.icon} /></div><div className="row-main"><h3>{item.name}</h3><p>{item.category} <span>·</span> {item.duration}</p></div><span className={`status-pill ${item.available ? 'available' : 'loaned'}`}>{item.available ? 'Available' : 'On loan'}</span><div className="row-actions"><button aria-label={`Edit ${item.name}`} onClick={() => onEdit(item)}><Edit3 size={16} /></button><button aria-label={`Delete ${item.name}`} onClick={() => onDelete(item.id)}><Trash2 size={16} /></button></div></div>) : <EmptyState icon={<PackageOpen />} title="Nothing listed yet" text="Share your first item with campus." action={onList} actionLabel="List an item" />}</section><section className="dashboard-panel requests-panel"><div className="panel-heading"><div><h2>Borrowing requests</h2><p>People asking to borrow your items</p></div><span className="panel-count">{requests.length}</span></div>{requests.length ? requests.map((request) => { const item = items.find((entry) => entry.id === request.itemId); return <RequestRow key={request.id} request={request} item={item} onUpdate={onUpdateRequest} /> }) : <EmptyState icon={<Bell />} title="All caught up" text="New requests will show up here." />}</section></div></div>
}

function RequestRow({ request, item, onUpdate }: { request: Request; item?: Item; onUpdate: (id: string, status: 'approved' | 'rejected') => void }) {
  return <div className="request-row"><div className="mini-avatar large">{request.borrower.split(' ').map((name) => name[0]).join('')}</div><div className="request-main"><h3>{request.borrower} <span>wants to borrow</span> {item?.name}</h3><p><CalendarDays size={13} /> {request.startDate} – {request.returnDate}</p>{request.message && <p className="request-message">“{request.message}”</p>}</div>{request.status === 'pending' ? <div className="request-actions"><button className="approve" onClick={() => onUpdate(request.id, 'approved')}><Check size={15} /> Approve</button><button className="reject" onClick={() => onUpdate(request.id, 'rejected')}>Decline</button></div> : <span className={`status-pill ${request.status}`}>{request.status}</span>}</div>
}

function MyBorrowings({ requests, items, onCancel, onReturn, onExplore }: { requests: Request[]; items: Item[]; onCancel: (id: string) => void; onReturn: (id: string) => void; onExplore: () => void }) {
  return <div className="page dashboard-page"><div className="dashboard-header"><div><p className="section-kicker">YOUR BORROWING HISTORY</p><h1>My borrowings</h1><p>Keep track of everything you have borrowed from campus.</p></div><button className="button secondary" onClick={onExplore}><Search size={16} /> Find something to borrow</button></div><div className="borrowings-list">{requests.length ? requests.map((request) => { const item = items.find((entry) => entry.id === request.itemId); return <div className="borrowing-card" key={request.id}><div className={`row-icon ${item?.color ?? 'lavender'}`}><ItemIcon type={item?.icon ?? 'box'} /></div><div className="borrowing-main"><div className="item-meta"><span className="item-category">{item?.category}</span><span>·</span><span>{item?.owner}</span></div><h2>{item?.name ?? 'Removed listing'}</h2><p><CalendarDays size={14} /> {request.startDate} – {request.returnDate}</p></div><div className="borrowing-side"><span className={`status-pill ${request.status}`}>{request.status}</span>{request.status === 'pending' && <button className="small-action" onClick={() => onCancel(request.id)}>Cancel request</button>}{request.status === 'approved' && <button className="button primary small" onClick={() => onReturn(request.id)}>Mark as returned <Check size={14} /></button>}</div></div> }) : <EmptyState icon={<BookOpen />} title="No borrowings yet" text="Explore the marketplace to find something useful." action={onExplore} actionLabel="Explore items" />}</div></div>
}

function Stat({ icon, number, label }: { icon: React.ReactNode; number: number; label: string }) {
  return <div className="stat-card"><span className="stat-icon">{icon}</span><span><strong>{number}</strong><small>{label}</small></span></div>
}

function EmptyState({ icon, title, text, action, actionLabel }: { icon: React.ReactNode; title: string; text: string; action?: () => void; actionLabel?: string }) {
  return <div className="empty-state"><span className="empty-icon">{icon}</span><h3>{title}</h3><p>{text}</p>{action && <button className="button secondary" onClick={action}>{actionLabel} <ArrowRight size={15} /></button>}</div>
}

export default App

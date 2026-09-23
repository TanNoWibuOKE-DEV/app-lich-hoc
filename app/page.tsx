'use client'

import { useEffect, useMemo, useState } from 'react'
import { AuthScreen } from '@/components/auth-screen'
import {
  CalendarDays,
  Check,
  ChevronLeft,
  ChevronRight,
  Clock3,
  Edit3,
  MapPin,
  Menu,
  Moon,
  MoreHorizontal,
  Plus,
  Search,
  Sun,
  Trash2,
  UserRound,
  X,
} from 'lucide-react'

type LocalUser = { email: string; password: string }

type Schedule = {
  id: string
  title: string
  date: string
  start: string
  end: string
  room: string
  note: string
  teacher: string
  color: 'mint' | 'lavender' | 'peach' | 'blue'
  completed?: boolean
}

const dateKey = (date: Date) => {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}
const addDays = (date: Date, amount: number) => {
  const next = new Date(date)
  next.setDate(next.getDate() + amount)
  return next
}
const formatDay = (date: Date) => new Intl.DateTimeFormat('vi-VN', { weekday: 'long', day: 'numeric', month: 'long' }).format(date)
const timeToMinutes = (value: string) => { const [hours, minutes] = value.split(':').map(Number); return hours * 60 + minutes }

const seedSchedules = (): Schedule[] => {
  const today = new Date()
  const tomorrow = addDays(today, 1)
  const after = addDays(today, 2)
  return [
    { id: '1', title: 'Tâm lý học đại cương', date: dateKey(today), start: '07:30', end: '09:30', room: 'Phòng B204 · Cơ sở chính', note: 'Mang theo giáo trình chương 3', teacher: 'ThS. Nguyễn Minh Anh', color: 'mint' },
    { id: '2', title: 'Lập trình Web nâng cao', date: dateKey(today), start: '10:00', end: '12:00', room: 'Lab máy tính · Tòa A', note: 'Nộp bài tập trước 23:59', teacher: 'TS. Trần Quốc Bảo', color: 'lavender' },
    { id: '3', title: 'Kinh tế vi mô', date: dateKey(tomorrow), start: '08:00', end: '10:00', room: 'Phòng C102 · Cơ sở chính', note: '', teacher: 'Cô Lê Thu Hà', color: 'peach' },
    { id: '4', title: 'Thiết kế trải nghiệm người dùng', date: dateKey(tomorrow), start: '13:30', end: '15:30', room: 'Studio 02 · Tòa D', note: 'Làm việc nhóm theo cặp', teacher: 'ThS. Phạm Hoàng Nam', color: 'blue' },
    { id: '5', title: 'Xác suất thống kê', date: dateKey(after), start: '09:00', end: '11:00', room: 'Phòng A301 · Cơ sở 2', note: '', teacher: 'TS. Vũ Thanh Tùng', color: 'blue' },
  ]
}

export default function Page() {
  const [schedules, setSchedules] = useState<Schedule[]>([])
  const [hydrated, setHydrated] = useState(false)
  const [selectedDate, setSelectedDate] = useState(new Date())
  const [activeTab, setActiveTab] = useState('today')
  const [dark, setDark] = useState(false)
  const [modalOpen, setModalOpen] = useState(false)
  const [editing, setEditing] = useState<Schedule | null>(null)
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [now, setNow] = useState(new Date())
  const [authReady, setAuthReady] = useState(false)
  const [currentUser, setCurrentUser] = useState<LocalUser | null>(null)

  useEffect(() => {
    const email = window.localStorage.getItem('study-session')
    const users: LocalUser[] = JSON.parse(window.localStorage.getItem('study-users') || '[]')
    setCurrentUser(users.find(user => user.email === email) || null)
    setAuthReady(true)
  }, [])

  useEffect(() => {
    const stored = window.localStorage.getItem('study-schedules')
    setSchedules(stored === null ? seedSchedules() : JSON.parse(stored))
    setDark(window.localStorage.getItem('study-dark') === 'true')
    setHydrated(true)
  }, [])
  useEffect(() => { if (hydrated) window.localStorage.setItem('study-schedules', JSON.stringify(schedules)) }, [hydrated, schedules])
  useEffect(() => { window.localStorage.setItem('study-dark', String(dark)); document.documentElement.classList.toggle('dark', dark) }, [dark])
  useEffect(() => { const timer = window.setInterval(() => setNow(new Date()), 30000); return () => window.clearInterval(timer) }, [])

  const todayKey = dateKey(new Date())
  const tomorrowKey = dateKey(addDays(new Date(), 1))
  const afterKey = dateKey(addDays(new Date(), 2))
  const visibleDate = activeTab === 'today' ? todayKey : activeTab === 'tomorrow' ? tomorrowKey : activeTab === 'after' ? afterKey : dateKey(selectedDate)
  const visibleSchedules = useMemo(() => schedules.filter(item => item.date === visibleDate).sort((a, b) => a.start.localeCompare(b.start)), [schedules, visibleDate])
  const upcoming = schedules.filter(item => !item.completed && item.date >= todayKey).length
  const completed = schedules.filter(item => item.completed).length

  if (!authReady) return <div className="auth-loading" />
  if (!currentUser) return <AuthScreen onSuccess={user => { setCurrentUser(user); window.localStorage.setItem('study-session', user.email) }} />

  const statusFor = (item: Schedule) => {
    if (item.completed) return { label: 'Đã hoàn thành', className: 'done' }
    if (item.date < todayKey || (item.date === todayKey && timeToMinutes(item.end) <= now.getHours() * 60 + now.getMinutes())) return { label: 'Đã kết thúc', className: 'ended' }
    if (item.date === todayKey && timeToMinutes(item.start) <= now.getHours() * 60 + now.getMinutes()) return { label: 'Đang diễn ra', className: 'live' }
    return { label: 'Sắp diễn ra', className: 'soon' }
  }
  const openAdd = () => { setEditing(null); setModalOpen(true) }
  const openEdit = (item: Schedule) => { setEditing(item); setModalOpen(true) }
  const saveSchedule = (item: Schedule) => { setSchedules(current => editing ? current.map(old => old.id === item.id ? item : old) : [...current, item]); setModalOpen(false) }

  return (
    <main className={dark ? 'app dark-mode' : 'app'}>
      <aside className="sidebar">
        <div className="brand"><div className="brand-mark"><CalendarDays size={21} /></div><span>Lịch học của tôi</span></div>
        <nav className="side-nav" aria-label="Điều hướng chính">
          <button className="side-link active"><CalendarDays size={19} /> Lịch học</button>
          <button className="side-link"><Check size={19} /> Việc cần làm <span className="nav-count">{upcoming}</span></button>
        </nav>
        <div className="sidebar-bottom"><div className="mini-profile"><div className="avatar" aria-label={`Tài khoản ${currentUser.email}`}>{currentUser.email.slice(0, 1).toUpperCase()}</div><div><b>{currentUser.email.slice(0, 1).toUpperCase()}</b><span>{currentUser.email}</span></div><button className="logout-btn" onClick={() => { window.localStorage.removeItem('study-session'); setCurrentUser(null) }}>Đăng xuất</button></div><div className="tip"><span>✨</span><p><b>Học tập vui hơn</b><br />Mỗi ngày một bước nhỏ.</p></div></div>
      </aside>
      <section className="content">
        <header className="topbar"><button className="mobile-menu" aria-label="Mở menu"><Menu size={22} /></button><div className="search"><Search size={17} /><input aria-label="Tìm kiếm lịch học" placeholder="Tìm kiếm môn học..." /></div><div className="top-actions"><button className="icon-btn" aria-label="Đổi giao diện" onClick={() => setDark(value => !value)}>{dark ? <Sun size={18} /> : <Moon size={18} />}</button><div className="top-avatar" aria-label={`Tài khoản ${currentUser.email}`}>{currentUser.email.slice(0, 1).toUpperCase()}</div></div></header>
        <div className="page-wrap">
          <div className="heading-row"><div><p className="eyebrow">TỔNG QUAN HỌC TẬP</p><h1>Lịch học của bạn <span>✦</span></h1><p className="subheading">Theo dõi lịch trình và chinh phục mục tiêu mỗi ngày.</p></div><button className="primary-btn" onClick={openAdd}><Plus size={18} /> Thêm lịch học</button></div>
          <section className="stats-grid"><div className="stat-card green"><div className="stat-icon"><CalendarDays size={20} /></div><div><span>Tổng lịch tuần này</span><strong>{schedules.length} <small>buổi học</small></strong></div></div><div className="stat-card purple"><div className="stat-icon"><Clock3 size={20} /></div><div><span>Sắp tới</span><strong>{upcoming} <small>buổi học</small></strong></div></div><div className="stat-card orange"><div className="stat-icon"><Check size={20} /></div><div><span>Đã hoàn thành</span><strong>{completed} <small>buổi học</small></strong></div></div></section>
          <div className="section-head"><div><h2>Lịch học</h2><p>{formatDay(new Date(visibleDate + 'T12:00:00'))}</p></div><button className="date-picker" onClick={() => { setActiveTab('custom'); setSelectedDate(new Date()) }}><CalendarDays size={16} /> Chọn ngày <ChevronRight size={16} /></button></div>
          <div className="tabs" role="tablist"><button className={activeTab === 'today' ? 'tab active' : 'tab'} onClick={() => setActiveTab('today')}>Hôm nay <em>{schedules.filter(x => x.date === todayKey).length}</em></button><button className={activeTab === 'tomorrow' ? 'tab active' : 'tab'} onClick={() => setActiveTab('tomorrow')}>Ngày mai <em>{schedules.filter(x => x.date === tomorrowKey).length}</em></button><button className={activeTab === 'after' ? 'tab active' : 'tab'} onClick={() => setActiveTab('after')}>Ngày mốt <em>{schedules.filter(x => x.date === afterKey).length}</em></button><button className={activeTab === 'custom' ? 'tab active' : 'tab'} onClick={() => setActiveTab('custom')}>Xem tất cả</button></div>
          {activeTab === 'custom' && <div className="custom-date"><button onClick={() => setSelectedDate(addDays(selectedDate, -1))}><ChevronLeft size={16} /></button><input type="date" value={dateKey(selectedDate)} onChange={event => setSelectedDate(new Date(event.target.value + 'T12:00:00'))} /><button onClick={() => setSelectedDate(addDays(selectedDate, 1))}><ChevronRight size={16} /></button></div>}
          <div className="schedule-list">{visibleSchedules.length ? visibleSchedules.map(item => <ScheduleCard key={item.id} item={item} status={statusFor(item)} onEdit={() => openEdit(item)} onDelete={() => setDeleteId(item.id)} onComplete={() => setSchedules(current => current.map(old => old.id === item.id ? { ...old, completed: !old.completed } : old))} />) : <div className="empty"><CalendarDays size={30} /><h3>Chưa có lịch học</h3><p>Thêm một lịch học để bắt đầu theo dõi nhé.</p><button className="primary-btn" onClick={openAdd}><Plus size={17} /> Thêm lịch học</button></div>}</div>
        </div>
      </section>
      {modalOpen && <ScheduleModal initial={editing} onClose={() => setModalOpen(false)} onSave={saveSchedule} />}
      {deleteId && <div className="overlay"><div className="confirm"><button className="close-btn" onClick={() => setDeleteId(null)}><X size={18} /></button><div className="confirm-icon"><Trash2 size={22} /></div><h3>Xóa lịch học này?</h3><p>Lịch học sẽ được xóa khỏi danh sách của bạn và không thể khôi phục.</p><div className="confirm-actions"><button className="secondary-btn" onClick={() => setDeleteId(null)}>Hủy</button><button className="danger-btn" onClick={() => { setSchedules(current => current.filter(item => item.id !== deleteId)); setDeleteId(null) }}>Xóa lịch</button></div></div></div>}
    </main>
  )
}

function ScheduleCard({ item, status, onEdit, onDelete, onComplete }: { item: Schedule; status: { label: string; className: string }; onEdit: () => void; onDelete: () => void; onComplete: () => void }) {
  return <article className={`schedule-card ${item.color} ${item.completed ? 'completed' : ''}`}><div className="time-col"><strong>{item.start}</strong><span>{item.end}</span></div><div className="card-content"><div className="card-title-row"><div><span className={`status ${status.className}`}><i />{status.label}</span><h3>{item.title}</h3></div><div className="card-actions"><button aria-label="Chỉnh sửa" onClick={onEdit}><Edit3 size={16} /></button><button aria-label="Xóa" onClick={onDelete}><Trash2 size={16} /></button></div></div><div className="meta-row"><span><MapPin size={15} /> {item.room}</span><span><UserRound size={15} /> {item.teacher}</span></div>{item.note && <p className="note">{item.note}</p>}</div><button className={`complete-btn ${item.completed ? 'checked' : ''}`} aria-label="Đánh dấu hoàn thành" onClick={onComplete}>{item.completed && <Check size={14} />}</button></article>
}

function ScheduleModal({ initial, onClose, onSave }: { initial: Schedule | null; onClose: () => void; onSave: (item: Schedule) => void }) {
  const [form, setForm] = useState<Schedule>(initial || { id: crypto.randomUUID(), title: '', date: dateKey(new Date()), start: '07:30', end: '09:30', room: '', note: '', teacher: '', color: 'mint' })
  const update = (key: keyof Schedule, value: string) => setForm(current => ({ ...current, [key]: value }))
  return <div className="overlay"><form className="modal" onSubmit={event => { event.preventDefault(); onSave(form) }}><div className="modal-head"><div><p className="eyebrow">LỊCH HỌC</p><h2>{initial ? 'Chỉnh sửa lịch học' : 'Thêm lịch học mới'}</h2></div><button type="button" className="close-btn" onClick={onClose}><X size={19} /></button></div><label>Tên môn học<input required value={form.title} onChange={event => update('title', event.target.value)} placeholder="VD: Lập trình Web nâng cao" /></label><div className="form-grid"><label>Ngày học<input required type="date" value={form.date} onChange={event => update('date', event.target.value)} /></label><label>Phòng học<input value={form.room} onChange={event => update('room', event.target.value)} placeholder="Phòng B204" /></label><label>Giờ bắt đầu<input required type="time" value={form.start} onChange={event => update('start', event.target.value)} /></label><label>Giờ kết thúc<input required type="time" value={form.end} onChange={event => update('end', event.target.value)} /></label></div><label>Giảng viên<input value={form.teacher} onChange={event => update('teacher', event.target.value)} placeholder="Tên giảng viên" /></label><label>Ghi chú <span className="optional">(không bắt buộc)</span><textarea rows={3} value={form.note} onChange={event => update('note', event.target.value)} placeholder="Thêm ghi chú cho buổi học..." /></label><div className="color-picker"><span>Màu thẻ</span>{(['mint', 'lavender', 'peach', 'blue'] as const).map(color => <button type="button" key={color} className={`color-dot ${color} ${form.color === color ? 'selected' : ''}`} onClick={() => setForm(current => ({ ...current, color }))} aria-label={`Màu ${color}`} />)}</div><div className="modal-actions"><button type="button" className="secondary-btn" onClick={onClose}>Hủy</button><button type="submit" className="primary-btn">{initial ? 'Lưu thay đổi' : 'Thêm lịch học'}</button></div></form></div>
}

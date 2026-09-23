'use client'

import { FormEvent, useState } from 'react'
import { CalendarDays, Check, Eye, EyeOff } from 'lucide-react'

type LocalUser = { name: string; email: string; password: string }

export function AuthScreen({ onSuccess }: { onSuccess: (user: LocalUser) => void }) {
  const [mode, setMode] = useState<'login' | 'register'>('login')
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')

  const submit = (event: FormEvent) => {
    event.preventDefault()
    const normalizedEmail = email.trim().toLowerCase()
    const users: LocalUser[] = JSON.parse(window.localStorage.getItem('study-users') || '[]')
    if (mode === 'register') {
      if (!name.trim() || password.length < 6) return setError('Vui lòng nhập tên và mật khẩu tối thiểu 6 ký tự.')
      if (users.some(user => user.email === normalizedEmail)) return setError('Email này đã được đăng ký.')
      const user = { name: name.trim(), email: normalizedEmail, password }
      window.localStorage.setItem('study-users', JSON.stringify([...users, user]))
      onSuccess(user)
    } else {
      const user = users.find(item => item.email === normalizedEmail && item.password === password)
      if (!user) return setError('Email hoặc mật khẩu chưa chính xác.')
      onSuccess(user)
    }
  }

  return <main className="auth-page"><section className="auth-card"><div className="auth-brand"><div className="brand-mark"><CalendarDays size={22} /></div><span>Lịch học của tôi</span></div><div className="auth-copy"><p className="eyebrow">CHÀO MỪNG BẠN</p><h1>{mode === 'login' ? 'Đăng nhập để tiếp tục' : 'Tạo tài khoản mới'}</h1><p>{mode === 'login' ? 'Theo dõi lịch học và mục tiêu của bạn mỗi ngày.' : 'Lưu lịch học riêng trên thiết bị của bạn.'}</p></div><form className="auth-form" onSubmit={submit}>{mode === 'register' && <label>Họ và tên<input required value={name} onChange={event => setName(event.target.value)} placeholder="Nguyễn Minh Anh" /></label>}<label>Email<input required type="email" value={email} onChange={event => setEmail(event.target.value)} placeholder="ban@example.com" /></label><label>Mật khẩu<div className="password-field"><input required type={showPassword ? 'text' : 'password'} value={password} onChange={event => setPassword(event.target.value)} placeholder="Tối thiểu 6 ký tự" minLength={6} /><button type="button" aria-label="Hiện hoặc ẩn mật khẩu" onClick={() => setShowPassword(value => !value)}>{showPassword ? <EyeOff size={17} /> : <Eye size={17} />}</button></div></label>{error && <p className="auth-error">{error}</p>}<button className="primary-btn auth-submit" type="submit">{mode === 'login' ? 'Đăng nhập' : 'Đăng ký'} <Check size={16} /></button></form><p className="auth-switch">{mode === 'login' ? 'Chưa có tài khoản?' : 'Đã có tài khoản?'} <button onClick={() => { setMode(mode === 'login' ? 'register' : 'login'); setError('') }}>{mode === 'login' ? 'Đăng ký ngay' : 'Đăng nhập'}</button></p><p className="local-note">Bản thử nghiệm: dữ liệu tài khoản được lưu trong localStorage của trình duyệt này.</p></section></main>
}

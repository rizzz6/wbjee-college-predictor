'use client'
import React from 'react'
import { 
  useAuth, 
  useTranslation, 
  Logout, 
  Button,
  useTheme
} from '@payloadcms/ui'
import { User, Shield, Settings, LogOut, Clock, Mail } from 'lucide-react'

const Section = ({ title, icon: Icon, children }: { title: string, icon: React.ElementType, children: React.ReactNode }) => (
  <section style={{ 
    backgroundColor: 'var(--theme-elevation-50)', 
    borderRadius: '0.75rem', 
    border: '1px solid var(--theme-elevation-150)',
    padding: '1.5rem',
    marginBottom: '1.5rem'
  }}>
    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.25rem', borderBottom: '1px solid var(--theme-elevation-100)', paddingBottom: '0.75rem' }}>
      <Icon size={20} style={{ color: 'var(--theme-text)' }} />
      <h2 style={{ fontSize: '1.1rem', fontWeight: 600, margin: 0 }}>{title}</h2>
    </div>
    {children}
  </section>
)

const InfoItem = ({ label, value, icon: Icon }: { label: string, value: string, icon?: React.ElementType }) => (
  <div style={{ marginBottom: '1rem' }}>
    <label style={{ display: 'block', fontSize: '0.75rem', textTransform: 'uppercase', opacity: 0.5, marginBottom: '0.25rem', fontWeight: 600 }}>{label}</label>
    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '1rem', fontWeight: 500 }}>
      {Icon && <Icon size={16} style={{ opacity: 0.6 }} />}
      <span>{value}</span>
    </div>
  </div>
)

const AccountClient: React.FC = () => {
  const { user } = useAuth()
  const { i18n } = useTranslation()
  const { theme, setTheme } = useTheme()

  const formatDate = (date: string | Date | undefined) => {
    if (!date) return 'N/A'
    return new Date(date).toLocaleString(undefined, {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', padding: '2rem 1rem' }}>
      <header style={{ marginBottom: '2.5rem', textAlign: 'center' }}>
        <div style={{ 
          width: '80px', 
          height: '80px', 
          borderRadius: '50%', 
          backgroundColor: 'var(--theme-elevation-200)', 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center',
          margin: '0 auto 1.5rem',
          boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
        }}>
          <User size={40} />
        </div>
        <h1 style={{ fontSize: '2rem', fontWeight: 700, marginBottom: '0.5rem' }}>Account Settings</h1>
        <p style={{ opacity: 0.6 }}>Manage your profile, security, and preferences.</p>
      </header>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: '1.5rem' }}>
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <Section title="Account Information" icon={Mail}>
            <InfoItem label="Email Address" value={user?.email || ''} icon={Mail} />
            <InfoItem label="Role" value={(user as { role?: string })?.role || 'Admin'} icon={Shield} />
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginTop: '1rem', paddingTop: '1rem', borderTop: '1px solid var(--theme-elevation-100)' }}>
              <InfoItem label="Created" value={formatDate(user?.createdAt)} icon={Clock} />
              <InfoItem label="Last Modified" value={formatDate(user?.updatedAt)} icon={Clock} />
            </div>
          </Section>

          <Section title="Security" icon={Shield}>
            <p style={{ fontSize: '0.875rem', opacity: 0.7, marginBottom: '1rem' }}>Keep your account secure by updating your password regularly.</p>
            <Button 
                buttonStyle="secondary" 
                size="small" 
                onClick={() => window.location.href = `/admin/collections/users/${user?.id}`}
              >
              Change Password & Details
            </Button>
          </Section>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <Section title="Payload Settings" icon={Settings}>
            <div style={{ marginBottom: '1.5rem' }}>
              <label style={{ display: 'block', fontSize: '0.75rem', textTransform: 'uppercase', opacity: 0.5, marginBottom: '0.75rem', fontWeight: 600 }}>Language</label>
              <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                 <span style={{ fontSize: '0.875rem', padding: '0.4rem 0.8rem', borderRadius: '0.25rem', backgroundColor: 'var(--theme-elevation-150)' }}>
                   {i18n.language === 'en' ? 'English' : i18n.language}
                 </span>
              </div>
            </div>

            <div style={{ marginBottom: '1.5rem' }}>
              <label style={{ display: 'block', fontSize: '0.75rem', textTransform: 'uppercase', opacity: 0.5, marginBottom: '0.75rem', fontWeight: 600 }}>Admin Theme</label>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                {(['light', 'dark'] as const).map((t) => (
                  <button
                    key={t}
                    onClick={() => setTheme(t)}
                    style={{
                      padding: '0.5rem 1rem',
                      borderRadius: '0.4rem',
                      border: '1px solid var(--theme-elevation-200)',
                      backgroundColor: theme === t ? 'var(--theme-elevation-300)' : 'transparent',
                      color: 'var(--theme-text)',
                      cursor: 'pointer',
                      fontSize: '0.875rem',
                      textTransform: 'capitalize',
                      fontWeight: theme === t ? 600 : 400
                    }}
                  >
                    {t}
                  </button>
                ))}
              </div>
            </div>

            <div style={{ fontSize: '0.75rem', opacity: 0.5, textDecoration: 'underline' }}>
              <Button buttonStyle="none" size="small">
                Reset Preferences
              </Button>
            </div>
          </Section>

          <Section title="Actions" icon={LogOut}>
            <p style={{ fontSize: '0.875rem', opacity: 0.7, marginBottom: '1.25rem' }}>Exit the admin panel and secure your session.</p>
            <div style={{ display: 'flex', width: '100%' }}>
              <div style={{ 
                  width: '100%', 
                  padding: '1rem', 
                  borderRadius: '0.5rem', 
                  backgroundColor: 'var(--theme-error, #f44336)', 
                  color: '#fff',
                  fontWeight: 600,
                  textAlign: 'center',
                  border: 'none',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                <Logout />
              </div>
            </div>
          </Section>
        </div>
      </div>
    </div>
  )
}

export default AccountClient

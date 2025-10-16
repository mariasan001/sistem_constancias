'use client';
import LoginForm from '@/features/auth/components/LoginForm';
import s from './login.module.css';

export default function LoginPage() {
  return (
    <div className={s.page}>
      <div className={s.container}>
        <section className={s.leftPanel}>
          <div className={s.leftContent}>
            <h1>Generador de constancias</h1>
            <p>Administra, emite y valida con una experiencia cuidada al milímetro.</p>
          </div>
        </section>
        <section className={s.rightPanel}>
          <div className={s.formWrap}>
            <div className={s.logoBox}><img src="/img/logo.png" alt="Logo institucional" width={140} /></div>
            <LoginForm />
          </div>
        </section>
      </div>
    </div>
  );
}

import Link from 'next/link';
import LoginForm from '@/components/forms/login-form';

export default function LoginPage() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="mt-6 text-center text-2xl font-bold tracking-tight">
          Sign in to your account
        </h2>
        <p className="mt-2 text-center text-sm text-gray-600">
          Or{' '}
          <Link
            href="/register"
            className="font-medium text-primary hover:text-primary/90"
          >
            create a new account
          </Link>
        </p>
      </div>
      <LoginForm />
    </div>
  );
}
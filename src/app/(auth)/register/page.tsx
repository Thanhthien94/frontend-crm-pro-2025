import Link from 'next/link';
import RegisterForm from '@/components/forms/register-form';

export default function RegisterPage() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="mt-6 text-center text-2xl font-bold tracking-tight">
          Create a new account
        </h2>
        <p className="mt-2 text-center text-sm text-gray-600">
          Already have an account?{' '}
          <Link
            href="/login"
            className="font-medium text-primary hover:text-primary/90"
          >
            Sign in
          </Link>
        </p>
      </div>
      <RegisterForm />
    </div>
  );
}
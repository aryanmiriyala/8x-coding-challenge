export const dynamic = "force-dynamic";
import { redirect } from 'next/navigation';
import { auth } from '@/lib/auth';

export default async function SignUpPage() {
  const { data: session } = await auth.getSession();
  if (session?.user) {
    redirect('/');
  }

  return (
    <div className="min-h-screen bg-white flex flex-col items-center pt-8">
      <div className="mb-4">
        <h1 className="text-3xl font-bold tracking-tight text-brand-strong">Aster Market</h1>
      </div>
      <div className="w-full max-w-sm border border-gray-300 rounded p-6 shadow-sm">
        <h2 className="text-2xl font-medium mb-4">Create account</h2>
        <form action={async (formData) => {
          'use server';
          const { auth } = await import('@/lib/auth');
          const name = formData.get('name') as string;
          const email = formData.get('email') as string;
          const password = formData.get('password') as string;
          
          await auth.signUp.email({ email, password, name });
          
          const { redirect } = await import('next/navigation');
          redirect('/');
        }} className="flex flex-col space-y-3">
          <div className="flex flex-col">
            <label className="text-sm font-bold mb-1" htmlFor="name">Your name</label>
            <input 
              id="name" 
              name="name" 
              type="text" 
              placeholder="First and last name"
              required 
              className="border border-gray-400 rounded px-3 py-1 outline-none focus:border-focus focus:shadow-[0_0_3px_2px_rgba(228,121,17,0.5)]"
            />
          </div>
          <div className="flex flex-col">
            <label className="text-sm font-bold mb-1" htmlFor="email">Email</label>
            <input 
              id="email" 
              name="email" 
              type="email" 
              required 
              className="border border-gray-400 rounded px-3 py-1 outline-none focus:border-focus focus:shadow-[0_0_3px_2px_rgba(228,121,17,0.5)]"
            />
          </div>
          <div className="flex flex-col">
            <label className="text-sm font-bold mb-1" htmlFor="password">Password</label>
            <input 
              id="password" 
              name="password" 
              type="password" 
              placeholder="At least 6 characters"
              required 
              className="border border-gray-400 rounded px-3 py-1 outline-none focus:border-focus focus:shadow-[0_0_3px_2px_rgba(228,121,17,0.5)]"
            />
          </div>
          <button type="submit" className="w-full bg-[#f3d078] hover:bg-[#f0c14b] text-black border border-[#a88734] rounded py-1 mt-2 text-sm font-medium shadow-sm">
            Verify email
          </button>
        </form>
        
        <div className="text-xs mt-4">
          By creating an account, you agree to Aster Market's <a href="#" className="text-link hover:underline">Conditions of Use</a> and <a href="#" className="text-link hover:underline">Privacy Notice</a>.
        </div>
        
        <div className="text-sm mt-6 border-t border-gray-300 pt-4">
          Already have an account? <a href="/auth/sign-in" className="text-link hover:underline">Sign in &gt;</a>
        </div>
      </div>
    </div>
  );
}

import { redirect } from 'next/navigation';
import { auth } from '@/lib/auth';

export default async function SignInPage() {
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
        <h2 className="text-2xl font-medium mb-4">Sign in</h2>
        <form action={async (formData) => {
          'use server';
          const { auth } = await import('@/lib/auth');
          const email = formData.get('email') as string;
          const password = formData.get('password') as string;
          
          await auth.signIn.email({ email, password });
          
          // Next.js actions will redirect automatically or we can force it
          const { redirect } = await import('next/navigation');
          redirect('/');
        }} className="flex flex-col space-y-3">
          <div className="flex flex-col">
            <label className="text-sm font-bold mb-1" htmlFor="email">Email or mobile phone number</label>
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
              required 
              className="border border-gray-400 rounded px-3 py-1 outline-none focus:border-focus focus:shadow-[0_0_3px_2px_rgba(228,121,17,0.5)]"
            />
          </div>
          <button type="submit" className="w-full bg-[#f3d078] hover:bg-[#f0c14b] text-black border border-[#a88734] rounded py-1 mt-2 text-sm font-medium shadow-sm">
            Continue
          </button>
        </form>
        
        <div className="text-xs mt-4">
          By continuing, you agree to Aster Market's <a href="#" className="text-link hover:underline">Conditions of Use</a> and <a href="#" className="text-link hover:underline">Privacy Notice</a>.
        </div>
      </div>
      
      <div className="w-full max-w-sm mt-6 flex items-center">
        <div className="flex-grow border-t border-gray-300"></div>
        <div className="px-2 text-xs text-gray-500">New to Aster Market?</div>
        <div className="flex-grow border-t border-gray-300"></div>
      </div>
      
      <div className="w-full max-w-sm mt-3">
        <form action={async (formData) => {
          'use server';
          const { auth } = await import('@/lib/auth');
          const email = formData.get('email') as string;
          const password = formData.get('password') as string;
          
          await auth.signUp.email({ 
            email, 
            password, 
            name: email.split('@')[0] 
          });
          
          const { redirect } = await import('next/navigation');
          redirect('/');
        }}>
          {/* We hide the inputs but carry over the values if they typed them in, or just redirect to a separate signup page in real life. For P0, we'll let them click a button that redirects to a signup route, but for simplicity here we'll just mock a quick sign up link */}
        </form>
        <a href="/auth/sign-up" className="block w-full text-center bg-gray-100 hover:bg-gray-200 text-black border border-gray-400 rounded py-1 text-sm font-medium shadow-sm transition-colors">
          Create your Aster Market account
        </a>
      </div>
    </div>
  );
}

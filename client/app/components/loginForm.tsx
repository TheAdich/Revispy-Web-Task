'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import axios from 'axios';
interface LoginFormData {
  username: string;
  password: string;
}

export default function LoginForm() {
  const router = useRouter();
  const [formData, setFormData] = useState<LoginFormData>({
    username: '',
    password: '',
  });
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    try {
        const res=await axios.post('http://localhost:5000/api/user/login',{username:formData.username,password:formData.password});
        if(res.status===200){
            sessionStorage.setItem('jwt', res.data.token);
            console.log(res.data.formattedUser);
            sessionStorage.setItem('authUser', JSON.stringify(res.data.formattedUser));
            router.push('/');
        }
        else{
            setError('Invalid credentials');
        }
    } catch (err:any) {
      setError(err.response.data.error);
    }
  };

  return (
    <div className="w-full max-w-md bg-slate-800 rounded-lg shadow-lg p-6">
      <div className="text-center mb-8">
        <h1 className="text-2xl font-bold text-white">Login</h1>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-500/10 border border-red-500 rounded text-red-500 text-sm">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label htmlFor="username" className="block text-sm font-medium text-gray-200 mb-2">
            Username
          </label>
          <input
            type="text"
            id="username"
            value={formData.username}
            onChange={(e) => setFormData(prev => ({ ...prev, username: e.target.value }))}
            className="w-full px-3 py-2 rounded-md bg-slate-700 border border-slate-600 text-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition"
            required
          />
        </div>

        <div>
          <label htmlFor="password" className="block text-sm font-medium text-gray-200 mb-2">
            Password
          </label>
          <input
            type="password"
            id="password"
            value={formData.password}
            onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
            className="w-full px-3 py-2 rounded-md bg-slate-700 border border-slate-600 text-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition"
            required
          />
        </div>

        <button
          type="submit"
          className="w-full py-2 px-4 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-md transition duration-200"
        >
          Login
        </button>

        <p className="text-center text-sm text-gray-400">
          Don't have an account?{' '}
          <Link href="/register" className="text-blue-400 hover:text-blue-300">
            Register here
          </Link>
        </p>
      </form>
    </div>
  );
}
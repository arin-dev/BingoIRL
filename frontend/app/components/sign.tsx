"use client"

import { useEffect, useState } from 'react';
import axios from 'axios';

import MiniFooter from './miniFooter';
import SubmitButton from './button';
import useAuthToken from '../hooks/useAuthToken';
import { InitialBg } from './initial_bg';

interface AuthFormProps {
    isSignIn: boolean;
    label: string;
    endpoint: string;
}

export const AuthForm: React.FC<AuthFormProps> = ({ isSignIn, label, endpoint }) => {
    const { token, updateToken } = useAuthToken();
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [errorMessage, setErrorMessage] = useState('');
    const [submitLabel, setSubmitLabel] = useState(label);

    useEffect(() => {
        setErrorMessage('');
        setSubmitLabel(label);
    }, [username, password, label]);

    useEffect(() => {
        if (token) {
            window.location.href = '/';
        }
    }, [token]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitLabel(isSignIn ? 'Signing you in...' : 'Signing you up...');
        setErrorMessage('');
        if (password && username) {
            try {
                const response = await axios.post(`http://localhost:8000/api/auth/${endpoint}`, {
                    username,
                    password
                });
                updateToken(response.data.token || '');
            } catch (error: any) {
                if (error.response) {
                    setErrorMessage(error.response.data.error || 'An error occurred');
                } else {
                    setErrorMessage('Network error');
                }
            }
        } else {
            setErrorMessage("Enter details to continue!");
        }
        setSubmitLabel(label);
    };

    return (
        <main className="flex min-h-screen flex-col items-center justify-center p-24 bg-gray-400">
            <InitialBg />
            <div className="z-10 w-[350px] h-[400px] font-mono text-sm flex flex-col items-center justify-around bg-white rounded-3xl opacity-[93%]">
                <h1 className="text-3xl font-bold pt-[50px]">{isSignIn ? 'Sign In' : 'Sign Up'}</h1>
                {errorMessage && <div className='text-red-500 text-center'>{errorMessage}</div>}
                <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
                    <input
                        type="text"
                        placeholder="Username"
                        className="border border-black rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 text-black"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                    />
                    <input
                        type="password"
                        placeholder="Password"
                        className="border border-black rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 text-black"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                    />
                    <SubmitButton label={submitLabel} onClick={handleSubmit} />
                </form>
                <div className="flex items-center pb-[50px]">
                    {isSignIn ? "Don't have an account?" : "Already have an account?"}
                    <a href={isSignIn ? "/signup" : "/signin"} className="text-blue-600 font-bold px-4 hover:text-purple-400">
                        {isSignIn ? 'Sign Up' : 'Sign In'}
                    </a>
                </div>
            </div>
            <MiniFooter />
        </main>
    );
};

// Usage example:
// <AuthForm isSignIn={true} label="Sign In" endpoint="login" />
// <AuthForm isSignIn={false} label="Sign Up" endpoint="register" />
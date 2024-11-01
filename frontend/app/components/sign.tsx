"use client"

import { useEffect, useState } from 'react';
import axios from 'axios';

import MiniFooter from './miniFooter';
import SubmitButton from './button';
import useAuthToken from '../hooks/useAuthToken';
import { InitialBg } from './initial_bg';

interface AuthFormProps {
    label: string;
    target: string;
    targetLabel: string;
    targetText: string;
    processingLabel: string;
    endpoint: string;
}

const BASE_URL = process.env.NEXT_PUBLIC_PRODUCTION_DOMAIN;

export const AuthForm: React.FC<AuthFormProps> = ({label, endpoint, processingLabel, target, targetLabel, targetText }) => {
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
        setSubmitLabel(processingLabel);
        setErrorMessage('');
        if (password && username) {
            try {
                const response = await axios.post(`${BASE_URL}api/auth/${endpoint}`, {
                    username,
                    password
                });
                updateToken(response.data.token || '');
                localStorage.setItem('userGames', JSON.stringify(response.data.currentGames || [])); // // Store games in local cache
                localStorage.setItem('username', response.data.username || ''); // Store username in local cache
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
                <h1 className="text-3xl font-bold pt-[50px]">{label}</h1>
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
                {targetText}
                    <a href={`/${target}`} className="text-blue-600 font-bold px-4 hover:text-purple-400">
                        {targetLabel}
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
"use client"

import { AuthForm } from '../components/sign';

export default function SignIn() {
    return <AuthForm label="Sign In" endpoint="login" target='signup' targetLabel='Sign Up' processingLabel='Singing you in...' targetText='Don&apos;t have an account?'/>;
}

// {isSignIn ? "Don't have an account?" : "Already have an account?"}
// <a href={isSignIn ? "/signup" : "/signin"} className="text-blue-600 font-bold px-4 hover:text-purple-400">
//     {isSignIn ? 'Sign Up' : 'Sign In'}
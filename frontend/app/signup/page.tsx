"use client"

import { AuthForm } from '../components/sign';

export default function SignIn() {
    return <AuthForm isSignIn={false} label="Sign Up" endpoint="register" />;
}
"use client"

import { AuthForm } from '../components/sign';

export default function SignIn() {
    return <AuthForm isSignIn={true} label="Sign In" endpoint="login" />;
}
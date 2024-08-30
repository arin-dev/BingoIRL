"use client"

import { AuthForm } from '../components/sign';

export default function SignIn() {
    return <AuthForm label="Sign Up" endpoint="register" target='signin' targetLabel='Sign In' processingLabel='Singing you up...' targetText='Already have an account?'/>;
}
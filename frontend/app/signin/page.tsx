"use client"

import { useEffect, useState } from 'react';
import axios from 'axios'
import SubmitButton from '../components/button';

import useAuthToken from '../hooks/useAuthToken';


export default function SignIn() {
    
    const { token, updateToken, clearToken } = useAuthToken();
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [errorMessage, setErrorMessage] = useState('');

    useEffect(()=>{
        setErrorMessage('')
    }, [username, password])

    useEffect(() => {
        if (token) {
            window.location.href = '/';
          }
    }, [token]);
  


    return (
        <main className="flex min-h-screen flex-col items-center justify-center p-24 bg-gray-400">
        {/* <div className="z-10 w-[350px] h-[500px] max-w-5xl items-center justify-around font-mono text-sm flex flex-col bg-gradient-to-t from-[rgb(0,0,0)] to-[rgb(0,0,250)] rounded-3xl"> */}
        <div className="z-10 w-[350px] h-[400px] items-center justify-around font-mono text-sm flex flex-col bg-white rounded-3xl">
            <h1 className="text-3xl font-bold pt-[50px]">Sign In</h1>
            {   errorMessage != '' && <div className='text-red-500'>{errorMessage}</div>}
            <form className="flex flex-col gap-4 ">
            <input
                type="text"
                placeholder="Username"
                className="border rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 text-black"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                />
            <input
                type="password"
                placeholder="Password"
                className="border rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 text-black"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                />
            <SubmitButton 
            onClick={async (e) =>{
                e.preventDefault();
                if(password != '' && username != '')
                try{
                    const response = await axios.post('http://localhost:8000/api/auth/login',{
                    username,
                    password
                })
                    updateToken(response.data.token || '');
                    // window.location.href = '/';                
                }catch (error : any ) {
                    console.error("Error during login:", error.response ? error.response.data : error.message);
                    setErrorMessage(error.response ? error.response.data.error : "An error occurred");
                }
                else
                    setErrorMessage("Enter details to continue!")
            }}
            label = "Sign In"
            />
            </form>
            <div className="flex items-center pb-[50px]">Don&apos;t have an account? <a href="/signup" className="text-blue-600 font-bold px-4 hover:text-purple-400">Sign Up</a></div>
            {/*The div with flex and items-center ensures both elements are on the same line.*/}
        </div>
        </main>
    );
}
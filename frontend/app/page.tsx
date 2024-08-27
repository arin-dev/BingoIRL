"use client"
import Header from './components/header';

export default function FunPage() {
  return (
    <>
    <Header currentPage='Home Page'/>
    <main className="flex flex-col items-center justify-center p-24">
        <h1 className="text-3xl font-bold">Welcome to the Wacky Wonderland!</h1>
        <p className="mt-4">Prepare for some utterly ridiculous activities:</p>
        <ul className="mt-2">
            <li>🎮 Challenge a potato to a game of chess</li>
            <li>🧩 Attempt to solve the mystery of the missing left sock</li>
            <li>🎨 Paint a masterpiece using only spaghetti</li>
            <li>📖 Read a story about a cat who thinks it&apos;s a dog</li>
        </ul>
        <button 
            className="mt-4 bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
            onClick={() => alert('Surprise! You just won a lifetime supply of rubber chickens!')}
        >
            Click for a Hilarious Surprise!
        </button>
    </main>
    </>
  );
}

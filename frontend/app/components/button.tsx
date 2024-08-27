interface SubmitButtonProps {
    onClick: (e: React.MouseEvent<HTMLButtonElement>) => void;
    label: string;
}

const SubmitButton: React.FC<SubmitButtonProps> = ({ onClick, label }) => {

    return (
    <button
        type="submit"
        className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
        onClick={onClick}
    >
    {label}
    </button>
    )
}

export default SubmitButton;
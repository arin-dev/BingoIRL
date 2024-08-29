import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faGithub, faLinkedin } from '@fortawesome/free-brands-svg-icons';
import { faEnvelope } from '@fortawesome/free-solid-svg-icons';
// import { Stick } from 'next/font/google';

const MiniFooter = () => {
    return (
        <footer className="flex flex-row items-center p-4 bg-gray-200 mt-auto justify-between" style={{ position: 'fixed', bottom: 0, width: '100%' }}>
            <p className='pl-10'> 2024 &copy;  </p>
            <p className='pl-[50px]'>Created with ❤️ by Arin Dev  </p>
            <div className="flex items-center">
                <a href="https://github.com/arin-dev" className="text-blue-600 hover:underline mr-8 ">
                    <FontAwesomeIcon icon={faGithub} size='2x' />
                </a>
                <a href="https://linkedin.com/in/arindev" className="text-blue-600 hover:underline mr-8">
                    <FontAwesomeIcon icon={faLinkedin} size='2x' />
                </a>
                <a href="mailto:arindev@gmail.com" className="text-blue-600 hover:underline mr-8">
                    <FontAwesomeIcon icon={faEnvelope} size='2x' />
                </a>
            </div>
        </footer>
    );
};

export default MiniFooter;

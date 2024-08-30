import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faGithub, faLinkedin } from '@fortawesome/free-brands-svg-icons';
import { faEnvelope } from '@fortawesome/free-solid-svg-icons';
// import { Stick } from 'next/font/google';

const MiniFooter = () => {
    return (
        <footer className="flex flex-row items-center p-4 bg-gray-200 mt-auto justify-between" style={{ position: 'fixed', bottom: 0, width: '100%' }}>
            <p className='sm:pl-10'> 2024 &copy;  </p>
            <p className='sm:pl-[50px]'>Created with ❤️ by Arin Dev  </p>
            <div className="flex items-center">
                <a href="https://github.com/arin-dev" className="text-blue-600 hover:underline mr-2 sm:mr-4 md:mr-6 lg:mr-8 text-2xl sm:text-lg md:text-2xl lg:text-3xl">
                    <FontAwesomeIcon icon={faGithub}/>
                </a>
                <a href="https://linkedin.com/in/arindev" className="text-blue-600 hover:underline mr-2 sm:mr-4 md:mr-6 lg:mr-8 text-2xl sm:text-lg md:text-2xl lg:text-3xl">
                    <FontAwesomeIcon icon={faLinkedin} size='1x' />
                </a>
                <a href="mailto:arindev@gmail.com" className="text-blue-600 hover:underline sm:mr-4 md:mr-6 lg:mr-8 text-2xl sm:text-lg md:text-2xl lg:text-3xl">
                    <FontAwesomeIcon icon={faEnvelope} size='1x' />
                </a>
            </div>
        </footer>
    );
};

export default MiniFooter;

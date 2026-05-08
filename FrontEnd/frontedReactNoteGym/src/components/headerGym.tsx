import { useState, useEffect } from 'react';

interface HeaderGymProps {
    alwaysCompact?: boolean;
}

export default function HeaderGym({ alwaysCompact = false }: HeaderGymProps) {
    const [isScrolled, setIsScrolled] = useState(alwaysCompact);
    const SCROLL_THRESHOLD = 50; 

    useEffect(() => {
        if (alwaysCompact) return;

        const handleScroll = () => {
            if (window.scrollY > SCROLL_THRESHOLD) {
                setIsScrolled(true);
            } else {
                setIsScrolled(false);
            }
        };
        window.addEventListener('scroll', handleScroll);
        return () => {
            window.removeEventListener('scroll', handleScroll);
        };
    }, [alwaysCompact]);

    const headerClasses = `
        fixed top-0 left-0 w-full z-30 transition-all duration-300 ease-in-out bg-gray-900 shadow-xl
        ${isScrolled ? 'h-16 p-2' : 'h-24 p-4'}
    `;

    const textSizeClass = isScrolled ? 'text-xl' : 'text-3xl'; 

    return (
        <header className={headerClasses}>
            <div className="flex mx-auto justify-center items-center h-full"> 
                <div className={`flex items-center transition-all duration-300`}>
                    <span 
                        className={`font-bold transition-all duration-300 ${textSizeClass}`}
                        style={{ color: "#FF5722" }}
                    >
                        NoteGym
                    </span>
                </div>
            </div>
        </header>
    );
}
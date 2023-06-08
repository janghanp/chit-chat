import { Dispatch, SetStateAction } from 'react';
import { useNavigate } from 'react-router-dom';
import { HiCog } from 'react-icons/hi';

import { useToggleSidebarContext } from '../context/toggleSidebarContext';

interface Props {
    setIsDropdownOpen: Dispatch<SetStateAction<boolean>>;
}

const SettingsButton = ({ setIsDropdownOpen }: Props) => {
    const navigate = useNavigate();
    const { toggleSidebar } = useToggleSidebarContext();

    const handleClick = async () => {
        setIsDropdownOpen(false);
        toggleSidebar();
        navigate('/settings');
    };

    return (
        <button className="flex" onClick={handleClick}>
            <HiCog className="text-xl" />
            <span className="ml-3">Settings</span>
        </button>
    );
};

export default SettingsButton;

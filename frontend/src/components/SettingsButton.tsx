import { Dispatch, SetStateAction } from 'react';
import { useNavigate } from 'react-router-dom';
import { HiCog } from 'react-icons/hi';

interface Props {
    closeSidebar: () => void;
    setIsDropdownOpen: Dispatch<SetStateAction<boolean>>;
}

const SettingsButton = ({ closeSidebar, setIsDropdownOpen }: Props) => {
    const navigate = useNavigate();

    const handleClick = async () => {
        closeSidebar();
        setIsDropdownOpen(false);

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

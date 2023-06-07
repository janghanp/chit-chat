import { Dispatch, SetStateAction } from 'react';
import { motion } from 'framer-motion';

import LogoutButton from './LogoutButton';
import SettingsButton from './SettingsButton';

interface Props {
    setIsDropdownOpen: Dispatch<SetStateAction<boolean>>;
}

const UserProfileDropdown = ({ setIsDropdownOpen }: Props) => {
    return (
        <>
            <div className="fixed inset-0 z-20" onClick={() => setIsDropdownOpen(false)}></div>
            <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="absolute bottom-12 z-30"
            >
                <ul className="menu bg-base-100 rounded-box menu-compact w-52 border p-2 shadow">
                    <li>
                        <SettingsButton
                            closeSidebar={() => console.log('test')}
                            setIsDropdownOpen={setIsDropdownOpen}
                        />
                    </li>
                    <li>
                        <LogoutButton setIsDropdownOpen={setIsDropdownOpen} />
                    </li>
                </ul>
            </motion.div>
        </>
    );
};

export default UserProfileDropdown;

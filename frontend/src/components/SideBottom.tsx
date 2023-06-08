import { memo, useState } from 'react';

import useUser from '../hooks/useUser';
import UserProfileDropdown from './UserProfileDropdown';
import defaultAvatar from '/default.jpg';
import Inbox from './Inbox';
import FriendsButton from './FriendsButton';
import ExploreButton from './ExploreButton';

const SideBottom = () => {
    const { data: currentUser } = useUser();
    const [isDropdownOpen, setIsDropdownOpen] = useState<boolean>(false);

    return (
        <div className="absolute bottom-0 left-0 right-0">
            <div className="bg-base-300 flex h-14 items-center justify-between px-5">
                <div className="flex items-center gap-x-3">
                    <div
                        className="avatar ring-base-content rounded-full transition duration-200 hover:cursor-pointer hover:ring-2"
                        onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                    >
                        <div
                            className={`absolute -top-0.5 right-0 z-10 h-3 w-3 rounded-full border bg-green-500`}
                        ></div>
                        <div className="w-8 rounded-full">
                            <img src={currentUser!.avatar || defaultAvatar} alt="avatar" />
                        </div>
                    </div>
                    <span className="text-sm font-bold">{currentUser?.username}</span>
                    {isDropdownOpen && (
                        <UserProfileDropdown setIsDropdownOpen={setIsDropdownOpen} />
                    )}
                </div>

                <div className="flex items-center gap-x-3 pt-1">
                    <ExploreButton />
                    <FriendsButton />
                    <Inbox />
                </div>
            </div>
        </div>
    );
};

export default memo(SideBottom);

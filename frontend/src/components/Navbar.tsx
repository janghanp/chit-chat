import ExplorerButton from './ExploreButton';
import FriendsButton from './FriendsButton';
import LogoutButton from './LogoutButton';
import Inbox from './Inbox';
import SettingsButton from './SettingsButton';

const Navbar = () => {
    const closeSidebar = () => {
        console.log('close');
    };

    return (
        <div className="md:bg-base-100 fixed bottom-0 z-30 flex h-[52px] w-full  items-center justify-evenly gap-x-5 border bg-gray-200 p-3 shadow-md md:relative md:h-full md:flex-col md:justify-center md:gap-y-10 md:rounded-md">
            <Inbox />
            <FriendsButton closeSidebar={closeSidebar} />
            <ExplorerButton closeSidebar={closeSidebar} />
            <SettingsButton closeSidebar={closeSidebar} />
            <LogoutButton />
        </div>
    );
};

export default Navbar;

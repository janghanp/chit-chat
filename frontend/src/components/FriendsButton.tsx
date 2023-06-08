import { useNavigate } from 'react-router-dom';
import { HiOutlineUsers } from 'react-icons/hi';

import { useToggleSidebarContext } from '../context/toggleSidebarContext';

const FriendsButton = () => {
    const navigate = useNavigate();
    const { toggleSidebar } = useToggleSidebarContext();

    const handleClick = async () => {
        toggleSidebar();
        navigate('/friends');
    };

    return (
        <div className="tooltip tooltip-top" data-tip="Friends">
            <button
                className="btn-ghost btn-sm btn btn-square"
                onClick={handleClick}
                data-cy="friend-button"
            >
                <HiOutlineUsers className="text-2xl" />
            </button>
        </div>
    );
};

export default FriendsButton;

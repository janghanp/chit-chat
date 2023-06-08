import { useNavigate } from 'react-router-dom';
import { IoCompassSharp } from 'react-icons/io5';

import { useToggleSidebarContext } from '../context/toggleSidebarContext';

const ExploreButton = () => {
    const navigate = useNavigate();
    const { toggleSidebar } = useToggleSidebarContext();

    const handleClick = async () => {
        toggleSidebar();
        navigate('/explorer');
    };

    return (
        <div className="tooltip tooltip-top" data-tip="Explore">
            <button className="btn-ghost btn-sm btn btn-square" onClick={handleClick}>
                <IoCompassSharp className="text-2xl" />
            </button>
        </div>
    );
};

export default ExploreButton;

import { useNavigate } from 'react-router-dom';
import { HiOutlineUsers } from 'react-icons/hi';

interface Props {
	closeSidebar: () => void;
}

const FriendsButton = ({ closeSidebar }: Props) => {
	const navigate = useNavigate();

	const handleClick = async () => {
		closeSidebar();

		navigate('/friends');
	};

	return (
		<div className="tooltip tooltip-top" data-tip="Friends">
			<button className="btn-ghost btn-sm btn px-1.5" onClick={handleClick} data-cy="friend-button">
				<HiOutlineUsers className="text-xl" />
			</button>
		</div>
	);
};

export default FriendsButton;

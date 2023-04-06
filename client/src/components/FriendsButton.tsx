import { useNavigate } from 'react-router-dom';
import { HiOutlineUsers } from 'react-icons/hi';

const FriendsButton = () => {
	const navigate = useNavigate();

	const handleClick = async () => {
		navigate('/friends');
	};

	return (
		<div className="tooltip tooltip-top" data-tip="Friends">
			<button className="btn-ghost btn-sm btn px-1.5" onClick={handleClick}>
				<HiOutlineUsers className="text-xl" />
			</button>
		</div>
	);
};

export default FriendsButton;

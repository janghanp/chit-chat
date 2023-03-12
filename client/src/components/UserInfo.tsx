import { Link } from 'react-router-dom';
import { HiCog } from 'react-icons/hi';

import { useUser } from '../context/UserContext';
import defaultAvatar from '/default.jpg';
import LogoutButton from './LogoutButton';

const UserInfo = () => {
	const { currentUser } = useUser();

	return (
		<div className="mt-5 border-t">
			{currentUser && (
				<div className="flex flex-row items-center justify-evenly pt-5">
					{/* Avatar */}
					<div className='flex flex-row items-center gap-x-2'>
						<div className="online avatar">
							<div className="w-10 rounded-full">
								<img src={currentUser.avatar || defaultAvatar} width={20} height={20} alt="avatar" />
							</div>
						</div>

						<span>{currentUser.username}</span>
					</div>

					<div className="tooltip" data-tip="User settings">
						<button className="btn-ghost btn-sm btn-circle btn text-2xl">
							<Link to="/settings">
								<HiCog />
							</Link>
						</button>
					</div>

					<LogoutButton />
				</div>
			)}
		</div>
	);
};

export default UserInfo;

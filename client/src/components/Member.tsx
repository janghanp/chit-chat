import { User } from '../types';
import defaultAvatar from '/default.jpg';

interface Props {
	member: User;
}

const Member = ({ member }: Props) => {
	return (
		<div className="flex flex-row items-center justify-start gap-x-3">
			<div className="avatar">
				<div
					className={`absolute -top-0.5 right-0 z-10 h-3 w-3 rounded-full border ${
						member.isOnline ? 'bg-green-500' : 'bg-gray-400'
					} `}
				></div>
				<div className="w-8 rounded-full">
					<img src={member.avatar || defaultAvatar} alt="avatar" />
				</div>
			</div>
			<span className="text-sm font-semibold">{member.username}</span>
		</div>
	);
};

export default Member;

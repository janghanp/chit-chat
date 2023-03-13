import { User } from '../types';

interface Props {
	member: User;
}

const Member = ({ member }: Props) => {
	return (
		<div className="flex flex-row items-center justify-start gap-x-3">
			<div className="avatar">
				<div className="w-8 rounded-full">
					<img src={member.avatar} alt="avatar" />
				</div>
			</div>
			<span className="font-semibold">{member.username}</span>
		</div>
	);
};

export default Member;

import { User } from '../types';
import Member from './Member';

interface Props {
	members: User[];
}

const MemberList = ({ members }: Props) => {
	return (
		<div className="fixed right-0 top-0 flex h-full w-56 flex-col gap-y-3 border-l bg-base-200 p-5 pt-16 shadow-md">
			{members.map((member) => {
				return (
					<div key={member.id}>
						<Member member={member} />
					</div>
				);
			})}
		</div>
	);
};

export default MemberList;

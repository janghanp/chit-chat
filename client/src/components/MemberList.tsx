import { User } from '../types';
import Member from './Member';

interface Props {
	members: User[];
}

const MemberList = ({ members }: Props) => {
	return (
		<div className="fixed right-0 flex h-full w-56 flex-col gap-y-3 bg-base-200 p-5 top-0 pt-16 shadow-md border-l">
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

import { memo } from 'react';

import { User } from '../types';
import Member from './Member';

interface Props {
	members: User[];
}

const MemberList = ({ members }: Props) => {
	return (
		<div className="fixed right-0 top-0 h-full flex w-full sm:w-56 flex-col gap-y-4 border-l bg-base-100 p-5 pt-16 shadow-md z-20">
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

export default memo(MemberList);

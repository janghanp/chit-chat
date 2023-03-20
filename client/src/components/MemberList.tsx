import { memo, useEffect, useState } from 'react';
import { createPortal } from 'react-dom';

import { User } from '../types';
import Member from './Member';

interface Props {
	members: User[];
	ownerId: string;
}

const MemberList = ({ members, ownerId }: Props) => {
	const [isLoading, setisLoading] = useState<boolean>(true);

	// Render necessary elements in the dom first and then map the members.
	useEffect(() => {
		setisLoading(false);
	}, []);

	return (
		<div className="fixed right-0 top-0 z-20 flex h-full w-full flex-col gap-y-4 border-l bg-base-100 p-5 pt-16 shadow-md sm:w-56">
			<div>
				<div className="mb-5 text-xs font-extrabold">HOST</div>
				<div id="host" className="flex flex-col gap-y-3"></div>
				<div className="divider my-1"></div>
			</div>

			<div>
				<div className="mb-5 text-xs font-extrabold">ONLINE</div>
				<div id="online" className="flex flex-col gap-y-3"></div>
				<div className="divider my-1"></div>
			</div>

			<div>
				<div className="mb-5 text-xs font-extrabold">OFFLINE</div>
				<div id="offline" className="flex flex-col gap-y-3"></div>
			</div>

			{!isLoading &&
				members.map((member) => {
					return (
						<div className="felx-col flex" key={member.id}>
							{ownerId === member.id ? (
								createPortal(<Member member={member} />, document.getElementById('host')!)
							) : (
								<>
									{member.isOnline
										? createPortal(<Member member={member} />, document.getElementById('online')!)
										: createPortal(<Member member={member} />, document.getElementById('offline')!)}
								</>
							)}
						</div>
					);
				})}
		</div>
	);
};

export default memo(MemberList);

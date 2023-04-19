import { Dispatch, Fragment, SetStateAction, useEffect } from 'react';

import { socket } from '../socket';
import { User } from '../types';
import Member from './Member';
import useMembers from '../hooks/useMembers';

interface Props {
	chatOwnerId: string | undefined;
	chatId: string;
	isOpenMemberList: boolean;
	setIsOpenMemberList: Dispatch<SetStateAction<boolean>>;
}

const MemberList = ({ chatOwnerId, chatId, isOpenMemberList, setIsOpenMemberList }: Props) => {
	const { isLoading, isError, data } = useMembers(chatId);

	useEffect(() => {
		if (data) {
			socket.emit('fetch_members');
		}
	}, [data]);

	if (!isOpenMemberList) {
		return <div></div>;
	}

	if (isLoading) {
		return <div></div>;
	}

	if (isError) {
		return <div>Error...</div>;
	}

	const deepCopyData = data!.map((el) => ({ ...el }));

	let host: User | undefined;

	if (chatOwnerId) {
		const hostIndex = deepCopyData.findIndex((memebr) => memebr.id === chatOwnerId);
		host = deepCopyData.splice(hostIndex, 1)[0];
	}

	const onlineMembers: User[] = [];
	const offlineMembers: User[] = [];

	if (deepCopyData.length > 0) {
		deepCopyData.forEach((member) => {
			if (member.isOnline) {
				onlineMembers.push(member);
			} else {
				offlineMembers.push(member);
			}
		});
	}

	return (
		<div className="fixed right-0 top-0 z-20 flex h-full w-full flex-col gap-y-4 border-l bg-base-100 p-5 pt-16 shadow-md sm:w-56">
			{host && (
				<div>
					<div className="mb-5 text-xs font-extrabold">HOST</div>
					<div id="host" className="flex flex-col gap-y-3">
						<Member member={host} setIsOpenMemberList={setIsOpenMemberList} />
					</div>
					<div className="divider my-1"></div>
				</div>
			)}
			<div>
				<div className="mb-5 text-xs font-extrabold">ONLINE</div>
				<div id="online" className="flex flex-col gap-y-3">
					{onlineMembers.length > 0 &&
						onlineMembers.map((member) => {
							return (
								<Fragment key={member.id}>
									<Member member={member} setIsOpenMemberList={setIsOpenMemberList} />
								</Fragment>
							);
						})}
				</div>
				<div className="divider my-1"></div>
			</div>
			<div>
				<div className="mb-5 text-xs font-extrabold">OFFLINE</div>
				<div id="offline" className="flex flex-col gap-y-3">
					{offlineMembers.length > 0 &&
						offlineMembers.map((member) => {
							return (
								<Fragment key={member.id}>
									<Member member={member} setIsOpenMemberList={setIsOpenMemberList} />
								</Fragment>
							);
						})}
				</div>
			</div>
		</div>
	);
};

export default MemberList;

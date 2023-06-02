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
		<div className="bg-base-100 ml-5 flex h-full w-64 flex-col gap-y-4 rounded-md border p-5 shadow-md">
			{/* Background for mobile screen */}
			<div
				className="fixed inset-0 -z-10 block bg-gray-600/50 md:hidden"
				onClick={() => setIsOpenMemberList(false)}
			></div>

			<div className="pb-10">
				<div className="text-3xl font-bold">Members</div>
			</div>
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
